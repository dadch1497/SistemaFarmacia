package pe.farmagest.ventas.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.ventas.dto.*;
import pe.farmagest.ventas.entity.*;
import pe.farmagest.ventas.event.VentasEventPublisher;
import pe.farmagest.ventas.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final SesionCajaRepository sesionCajaRepository;
    private final ClienteRepository clienteRepository;
    private final PromocionRepository promocionRepository;
    private final CuponRepository cuponRepository;
    private final VentaEsperaRepository ventaEsperaRepository;
    private final PromocionService promocionService;
    private final VentasEventPublisher eventPublisher;
    private final SunatPhpClient sunatPhpClient;
    private final DevolucionRepository devolucionRepository;

    public VentaService(VentaRepository ventaRepository,
                        DetalleVentaRepository detalleVentaRepository,
                        SesionCajaRepository sesionCajaRepository,
                        ClienteRepository clienteRepository,
                        PromocionRepository promocionRepository,
                        CuponRepository cuponRepository,
                        VentaEsperaRepository ventaEsperaRepository,
                        PromocionService promocionService,
                        VentasEventPublisher eventPublisher,
                        SunatPhpClient sunatPhpClient,
                        DevolucionRepository devolucionRepository) {
        this.devolucionRepository = devolucionRepository;
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.sesionCajaRepository = sesionCajaRepository;
        this.clienteRepository = clienteRepository;
        this.promocionRepository = promocionRepository;
        this.cuponRepository = cuponRepository;
        this.ventaEsperaRepository = ventaEsperaRepository;
        this.promocionService = promocionService;
        this.eventPublisher = eventPublisher;
        this.sunatPhpClient = sunatPhpClient;
    }

    @Transactional
    public VentaDto registrarVenta(RegistrarVentaRequest request, Long usuarioId, String nombreVendedor) {
        Integer sucursalId = request.getSucursalId() != null ? request.getSucursalId() : 1;

        // 1. Validar sesión de caja activa
        SesionCaja sesionCaja;
        if (request.getSesionCajaId() != null) {
            sesionCaja = sesionCajaRepository.findById(request.getSesionCajaId())
                    .orElseThrow(() -> new IllegalArgumentException("Sesión de caja no encontrada"));
        } else {
            sesionCaja = sesionCajaRepository.findFirstByUsuarioIdAndSucursalIdAndEstado(usuarioId, sucursalId, EstadoSesionCaja.ABIERTA)
                    .orElseThrow(() -> new IllegalStateException("Debe tener un turno de caja abierto para realizar ventas en el POS"));
        }

        if (sesionCaja.getEstado() != EstadoSesionCaja.ABIERTA) {
            throw new IllegalStateException("La sesión de caja seleccionada no se encuentra abierta");
        }

        // 2. Resolver o registrar Cliente
        Cliente cliente = null;
        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        } else if (request.getClienteNumeroDocumento() != null && !request.getClienteNumeroDocumento().isBlank()) {
            String doc = request.getClienteNumeroDocumento().trim();
            cliente = clienteRepository.findByNumeroDocumentoAndActivoTrue(doc)
                    .orElseGet(() -> {
                        TipoDocumento tipo = doc.length() == 11 ? TipoDocumento.RUC : TipoDocumento.DNI;
                        String nom = (request.getClienteNombre() != null && !request.getClienteNombre().isBlank())
                                ? request.getClienteNombre().trim()
                                : "CLIENTE " + doc;
                        Cliente nuevo = new Cliente(tipo, doc, nom, request.getClienteDireccion(), null, null);
                        return clienteRepository.save(nuevo);
                    });
        } else {
            // Cliente genérico si no se especificó documento
            cliente = clienteRepository.findByNumeroDocumentoAndActivoTrue("00000000").orElse(null);
        }

        // Si es Factura, validar que el cliente tenga RUC
        if (request.getTipoComprobante() == TipoComprobante.FACTURA) {
            if (cliente == null || cliente.getTipoDocumento() != TipoDocumento.RUC) {
                throw new IllegalArgumentException("Para emitir FACTURA se requiere registrar un cliente con RUC válido de 11 dígitos");
            }
        }

        // 3. Generar serie y correlativo único
        String serie = switch (request.getTipoComprobante()) {
            case BOLETA -> "B001";
            case FACTURA -> "F001";
            case NOTA_VENTA -> "NV01";
        };
        long correlativoActual = ventaRepository.countByTipoComprobanteAndSerieComprobante(request.getTipoComprobante(), serie);
        String numero = String.format("%08d", correlativoActual + 1);

        // 4. Calcular ítems y totales
        BigDecimal subtotalBruto = BigDecimal.ZERO;
        BigDecimal totalDescuentoItems = BigDecimal.ZERO;

        Venta venta = new Venta();
        venta.setSucursalId(sucursalId);
        venta.setSesionCaja(sesionCaja);
        venta.setCliente(cliente);
        venta.setUsuarioVendedorId(usuarioId);
        venta.setTipoComprobante(request.getTipoComprobante());
        venta.setSerieComprobante(serie);
        venta.setNumeroComprobante(numero);
        venta.setMedioPago(request.getMedioPago());
        venta.setEstado(EstadoVenta.COMPLETADA);
        venta.setFechaHora(LocalDateTime.now());
        venta.setObservaciones(request.getObservaciones());

        for (ItemVentaRequest it : request.getItems()) {
            BigDecimal precio = it.getPrecioUnitario();
            BigDecimal costo = it.getCostoUnitario() != null ? it.getCostoUnitario() : BigDecimal.ZERO;
            BigDecimal descLinea = it.getDescuento() != null ? it.getDescuento() : BigDecimal.ZERO;
            int cant = it.getCantidad();

            // Regla de negocio: Alerta si vende por debajo del costo
            if (costo.compareTo(BigDecimal.ZERO) > 0 && precio.compareTo(costo) < 0) {
                throw new IllegalStateException("El precio de venta (S/ " + precio + ") no puede ser menor al costo (S/ " + costo + ")");
            }

            BigDecimal importeBruto = precio.multiply(BigDecimal.valueOf(cant));
            BigDecimal subtotalLinea = importeBruto.subtract(descLinea).max(BigDecimal.ZERO);

            subtotalBruto = subtotalBruto.add(importeBruto);
            totalDescuentoItems = totalDescuentoItems.add(descLinea);

            DetalleVenta det = new DetalleVenta();
            det.setProductoId(it.getProductoId());
            det.setLoteId(it.getLoteId());
            det.setNumeroLote(it.getNumeroLote());
            det.setCantidad(cant);
            det.setPrecioUnitario(precio);
            det.setCostoUnitario(costo);
            det.setDescuentoLinea(descLinea);
            det.setSubtotalLinea(subtotalLinea);

            venta.agregarDetalle(det);
        }

        // 5. Aplicar Promoción o Cupón global
        BigDecimal descuentoGlobal = BigDecimal.ZERO;
        if (request.getCuponCodigo() != null && !request.getCuponCodigo().isBlank()) {
            ValidarCuponRequest cuponReq = new ValidarCuponRequest();
            cuponReq.setCodigo(request.getCuponCodigo());
            cuponReq.setMontoVenta(subtotalBruto.subtract(totalDescuentoItems));
            ValidarCuponResponse cuponResp = promocionService.validarCupon(cuponReq);

            if (cuponResp.isValido()) {
                descuentoGlobal = cuponResp.getMontoDescuentoCalculado();
                cuponRepository.findById(cuponResp.getCuponId()).ifPresent(venta::setCupon);
                promocionService.registrarUsoCupon(cuponResp.getCuponId());
            }
        } else if (request.getCuponId() != null) {
            cuponRepository.findById(request.getCuponId()).ifPresent(c -> {
                venta.setCupon(c);
                promocionService.registrarUsoCupon(c.getId());
            });
        }

        if (request.getPromocionId() != null) {
            promocionRepository.findById(request.getPromocionId()).ifPresent(venta::setPromocion);
        }

        // Descuento manual del vendedor (máximo 5%)
        BigDecimal descManual = request.getDescuentoManual() != null ? request.getDescuentoManual() : BigDecimal.ZERO;
        BigDecimal maxDescManualPermitido = subtotalBruto.multiply(new BigDecimal("0.05"));
        if (descManual.compareTo(maxDescManualPermitido) > 0) {
            throw new IllegalArgumentException("El descuento manual no puede exceder el 5% del valor de la venta (Máximo: S/ " + maxDescManualPermitido + ")");
        }

        BigDecimal montoDescuentoTotal = totalDescuentoItems.add(descuentoGlobal).add(descManual);
        BigDecimal totalFinal = subtotalBruto.subtract(montoDescuentoTotal).max(BigDecimal.ZERO);

        // Desglose IGV 18% (total = base + igv => base = total / 1.18)
        BigDecimal baseImponible = totalFinal.divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
        BigDecimal montoIgv = totalFinal.subtract(baseImponible);

        venta.setSubtotal(baseImponible);
        venta.setMontoDescuento(montoDescuentoTotal);
        venta.setIgv(montoIgv);
        venta.setTotal(totalFinal);

        // Validar pago en efectivo y vuelto
        if (request.getMedioPago() == MedioPago.EFECTIVO) {
            BigDecimal recibido = request.getMontoRecibido() != null ? request.getMontoRecibido() : totalFinal;
            if (recibido.compareTo(totalFinal) < 0) {
                throw new IllegalArgumentException("El monto recibido en efectivo (S/ " + recibido + ") es menor al total a pagar (S/ " + totalFinal + ")");
            }
            venta.setMontoRecibido(recibido);
            venta.setVuelto(recibido.subtract(totalFinal));
        } else {
            venta.setMontoRecibido(totalFinal);
            venta.setVuelto(BigDecimal.ZERO);
        }

        Venta guardada = ventaRepository.save(venta);

        // 6. Publicar evento RabbitMQ asíncrono hacia ms-inventario y ms-reportes
        eventPublisher.publicarVentaRegistrada(guardada);
        // Envío de factura a SUNAT mediante el micro‑servicio PHP
        try {
            sunatPhpClient.enviarFactura(guardada);
        } catch (Exception e) {
            // Logueamos pero no impedimos la finalización de la venta
            org.slf4j.LoggerFactory.getLogger(VentaService.class).warn("Error al enviar factura a SUNAT vía PHP: {}", e.getMessage());
        }

        return mapearADto(guardada, nombreVendedor);
    }

    @Transactional
    public VentaDto anularVenta(Long ventaId, AnularVentaRequest request, Long usuarioId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con ID: " + ventaId));

        if (venta.getEstado() == EstadoVenta.ANULADA) {
            throw new IllegalStateException("La venta ya ha sido anulada previamente");
        }

        venta.setEstado(EstadoVenta.ANULADA);
        venta.setObservaciones((venta.getObservaciones() != null ? venta.getObservaciones() + " | " : "") + "ANULADA: " + request.getMotivo());

        Venta guardada = ventaRepository.save(venta);

        // Publicar evento RabbitMQ venta.anulada para reponer el stock en inventario
        eventPublisher.publicarVentaAnulada(guardada, request.getMotivo(), usuarioId);

        return mapearADto(guardada, null);
    }

    public List<VentaDto> listarVentas(Integer sucursalId, Long usuarioId, boolean esAdmin) {
        List<Venta> ventas;
        if (esAdmin) {
            ventas = ventaRepository.findBySucursalIdOrderByFechaHoraDesc(sucursalId);
        } else {
            ventas = ventaRepository.findByUsuarioVendedorIdAndSucursalIdOrderByFechaHoraDesc(usuarioId, sucursalId);
        }
        return ventas.stream().map(v -> mapearADto(v, null)).collect(Collectors.toList());
    }

    public VentaDto obtenerVentaPorId(Long id) {
        Venta v = ventaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con ID: " + id));
        return mapearADto(v, null);
    }

    // ==========================================
    // Ventas en Espera
    // ==========================================
    @Transactional
    public VentaEsperaDto guardarVentaEnEspera(GuardarVentaEsperaRequest request, Long usuarioId) {
        VentaEspera ve = new VentaEspera();
        ve.setUsuarioId(usuarioId);
        ve.setSucursalId(1);
        ve.setCodigoEspera("ESP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ve.setNombreReferencia(request.getNombreReferencia() != null ? request.getNombreReferencia() : "Venta en espera");
        ve.setDatosJson(request.getDatosJson());
        ve.setFechaHora(LocalDateTime.now());

        VentaEspera guardada = ventaEsperaRepository.save(ve);

        VentaEsperaDto dto = new VentaEsperaDto();
        dto.setId(guardada.getId());
        dto.setUsuarioId(guardada.getUsuarioId());
        dto.setSucursalId(guardada.getSucursalId());
        dto.setCodigoEspera(guardada.getCodigoEspera());
        dto.setNombreReferencia(guardada.getNombreReferencia());
        dto.setDatosJson(guardada.getDatosJson());
        dto.setFechaHora(guardada.getFechaHora());
        return dto;
    }

    public List<VentaEsperaDto> listarVentasEnEspera(Long usuarioId) {
        return ventaEsperaRepository.findByUsuarioIdOrderByFechaHoraDesc(usuarioId).stream()
                .map(ve -> {
                    VentaEsperaDto dto = new VentaEsperaDto();
                    dto.setId(ve.getId());
                    dto.setUsuarioId(ve.getUsuarioId());
                    dto.setSucursalId(ve.getSucursalId());
                    dto.setCodigoEspera(ve.getCodigoEspera());
                    dto.setNombreReferencia(ve.getNombreReferencia());
                    dto.setDatosJson(ve.getDatosJson());
                    dto.setFechaHora(ve.getFechaHora());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Transactional
    public void eliminarVentaEnEspera(Long id) {
        ventaEsperaRepository.deleteById(id);
    }

    private VentaDto mapearADto(Venta v, String nombreVendedor) {
        VentaDto dto = new VentaDto();
        dto.setId(v.getId());
        dto.setSucursalId(v.getSucursalId());
        dto.setSesionCajaId(v.getSesionCaja() != null ? v.getSesionCaja().getId() : null);
        if (v.getCliente() != null) {
            Cliente c = v.getCliente();
            dto.setCliente(new ClienteDto(
                    c.getId(), c.getTipoDocumento(), c.getNumeroDocumento(),
                    c.getNombresORazonSocial(), c.getDireccion(), c.getTelefono(), c.getEmail(), c.getActivo()
            ));
        }
        dto.setUsuarioVendedorId(v.getUsuarioVendedorId());
        dto.setNombreVendedor(nombreVendedor);
        dto.setTipoComprobante(v.getTipoComprobante());
        dto.setSerieComprobante(v.getSerieComprobante());
        dto.setNumeroComprobante(v.getNumeroComprobante());
        dto.setSubtotal(v.getSubtotal());
        dto.setMontoDescuento(v.getMontoDescuento());
        dto.setIgv(v.getIgv());
        dto.setTotal(v.getTotal());
        dto.setMedioPago(v.getMedioPago());
        dto.setMontoRecibido(v.getMontoRecibido());
        dto.setVuelto(v.getVuelto());
        if (v.getPromocion() != null) {
            dto.setPromocionId(v.getPromocion().getId());
            dto.setPromocionNombre(v.getPromocion().getNombre());
        }
        if (v.getCupon() != null) {
            dto.setCuponId(v.getCupon().getId());
            dto.setCuponCodigo(v.getCupon().getCodigo());
        }
        dto.setEstado(v.getEstado());
        dto.setFechaHora(v.getFechaHora());
        dto.setObservaciones(v.getObservaciones());

        if (v.getDetalles() != null) {
            dto.setDetalles(v.getDetalles().stream().map(d -> {
                DetalleVentaDto detDto = new DetalleVentaDto();
                detDto.setId(d.getId());
                detDto.setProductoId(d.getProductoId());
                detDto.setLoteId(d.getLoteId());
                detDto.setNumeroLote(d.getNumeroLote());
                detDto.setCantidad(d.getCantidad());
                detDto.setPrecioUnitario(d.getPrecioUnitario());
                detDto.setCostoUnitario(d.getCostoUnitario());
                detDto.setDescuentoLinea(d.getDescuentoLinea());
                detDto.setSubtotalLinea(d.getSubtotalLinea());
                return detDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    // ==========================================
    // NOTAS DE CRÉDITO Y DEVOLUCIONES
    // ==========================================
    @Transactional
    public NotaCreditoDto emitirNotaCredito(EmitirNotaCreditoRequest request, Long usuarioId) {
        Venta venta = ventaRepository.findById(request.getVentaId())
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada: " + request.getVentaId()));

        if (venta.getEstado() == EstadoVenta.ANULADA) {
            throw new IllegalStateException("La venta ya se encuentra anulada.");
        }

        Devolucion devolucion = new Devolucion();
        devolucion.setVenta(venta);
        devolucion.setUsuarioId(usuarioId != null ? usuarioId : 1L);
        devolucion.setSucursalId(venta.getSucursalId());
        devolucion.setMotivo(request.getMotivoSustento());
        devolucion.setTipoNotaCredito(request.getTipoNotaCredito() != null ? request.getTipoNotaCredito() : "07");
        devolucion.setMedioReembolso(request.getMedioReembolso() != null ? request.getMedioReembolso() : venta.getMedioPago());
        devolucion.setFechaHora(LocalDateTime.now());

        // Generar Serie y Correlativo según normativa SUNAT
        String serieNC = (venta.getTipoComprobante() == TipoComprobante.FACTURA) ? "FC01" : "BC01";
        long totalNcPrevias = devolucionRepository.count();
        String correlativoNC = String.format("%08d", totalNcPrevias + 1);
        devolucion.setSerieNotaCredito(serieNC);
        devolucion.setNumeroNotaCredito(correlativoNC);

        BigDecimal totalDevuelto = BigDecimal.ZERO;

        for (ItemDevolucionRequest it : request.getItems()) {
            DetalleDevolucion det = new DetalleDevolucion();
            det.setProductoId(it.getProductoId());
            det.setNombreProducto(it.getNombreProducto() != null ? it.getNombreProducto() : "Medicamento #" + it.getProductoId());
            det.setLoteId(it.getLoteId());
            det.setNumeroLote(it.getNumeroLote());
            det.setCantidad(it.getCantidadDevuelta());

            BigDecimal precio = it.getPrecioUnitario() != null ? it.getPrecioUnitario() : BigDecimal.ZERO;
            det.setPrecioUnitario(precio);
            BigDecimal montoLinea = precio.multiply(BigDecimal.valueOf(it.getCantidadDevuelta())).setScale(2, RoundingMode.HALF_UP);
            det.setMontoReembolsado(montoLinea);
            det.setReingresaAStock(it.getReingresaAStock() != null ? it.getReingresaAStock() : true);

            devolucion.agregarDetalle(det);
            totalDevuelto = totalDevuelto.add(montoLinea);
        }

        BigDecimal subtotalDevuelto = totalDevuelto.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
        BigDecimal igvDevuelto = totalDevuelto.subtract(subtotalDevuelto);

        devolucion.setTotalDevuelto(totalDevuelto);
        devolucion.setSubtotalDevuelto(subtotalDevuelto);
        devolucion.setIgvDevuelto(igvDevuelto);

        devolucion.setHashCpe("hash-cpe-nc-" + UUID.randomUUID().toString().substring(0, 16));
        devolucion.setQrCodeUrl("https://sunat.gob.pe/cpe?ruc=10734577583&tipo=07&serie=" + serieNC + "&numero=" + correlativoNC);
        devolucion.setEstadoSunat("PENDIENTE");

        // Guardar devolución
        Devolucion guardada = devolucionRepository.save(devolucion);

        // Envío formal a SUNAT vía ms-sunat-php (Greenter UBL 2.1)
        try {
            Map<String, Object> sunatResp = sunatPhpClient.enviarNotaCredito(guardada);
            if (sunatResp != null && !sunatResp.isEmpty()) {
                String estado = (String) sunatResp.get("estadoSunat");
                if (estado != null) {
                    guardada.setEstadoSunat(estado);
                }
                String hash = (String) sunatResp.get("hashCpe");
                if (hash != null) {
                    guardada.setHashCpe(hash);
                    guardada.setQrCodeUrl("https://sunat.gob.pe/cpe?ruc=10734577583&tipo=07&serie=" + serieNC + "&numero=" + correlativoNC + "&monto=" + guardada.getTotalDevuelto() + "&hash=" + hash);
                }
                guardada = devolucionRepository.save(guardada);
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(VentaService.class).warn("Error al emitir Nota de Crédito ante SUNAT vía PHP: {}", e.getMessage());
        }

        // Si es devolución total, anular venta
        if ("01".equals(request.getTipoNotaCredito()) || "06".equals(request.getTipoNotaCredito())) {
            venta.setEstado(EstadoVenta.ANULADA);
            ventaRepository.save(venta);
        }

        return mapearNotaCreditoDto(guardada);
    }

    @Transactional(readOnly = true)
    public List<NotaCreditoDto> listarNotasCredito(Integer sucursalId) {
        return devolucionRepository.findBySucursalIdOrderByFechaHoraDesc(sucursalId)
                .stream().map(this::mapearNotaCreditoDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NotaCreditoDto obtenerNotaCreditoPorId(Long id) {
        Devolucion d = devolucionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nota de crédito no encontrada: " + id));
        return mapearNotaCreditoDto(d);
    }

    @Transactional(readOnly = true)
    public VentaDto buscarComprobante(String q) {
        List<Venta> todas = ventaRepository.findAll();
        String query = q.trim().toLowerCase();
        for (Venta v : todas) {
            String serieNum = (v.getSerieComprobante() + "-" + v.getNumeroComprobante()).toLowerCase();
            if (serieNum.contains(query) || v.getNumeroComprobante().contains(query)) {
                return mapearADto(v, null);
            }
        }
        throw new IllegalArgumentException("Comprobante no encontrado: " + q);
    }

    private NotaCreditoDto mapearNotaCreditoDto(Devolucion d) {
        NotaCreditoDto dto = new NotaCreditoDto();
        dto.setId(d.getId());
        dto.setSucursalId(d.getSucursalId());
        dto.setVentaId(d.getVenta().getId());
        dto.setTipoComprobanteModificado(d.getVenta().getTipoComprobante());
        dto.setSerieComprobanteModificado(d.getVenta().getSerieComprobante());
        dto.setNumeroComprobanteModificado(d.getVenta().getNumeroComprobante());
        dto.setSerieNotaCredito(d.getSerieNotaCredito());
        dto.setNumeroNotaCredito(d.getNumeroNotaCredito());
        dto.setTipoNotaCredito(d.getTipoNotaCredito());
        dto.setDescripcionTipoNotaCredito(d.getDescripcionTipoNc());
        dto.setMotivoSustento(d.getMotivo());
        dto.setFechaHora(d.getFechaHora());
        dto.setSubtotalDevuelto(d.getSubtotalDevuelto());
        dto.setIgvDevuelto(d.getIgvDevuelto());
        dto.setTotalDevuelto(d.getTotalDevuelto());
        dto.setMedioReembolso(d.getMedioReembolso());
        dto.setHashCpe(d.getHashCpe());
        dto.setQrCodeUrl(d.getQrCodeUrl());
        dto.setEstadoSunat(d.getEstadoSunat());

        if (d.getVenta().getCliente() != null) {
            Cliente c = d.getVenta().getCliente();
            ClienteDto cDto = new ClienteDto();
            cDto.setId(c.getId());
            cDto.setTipoDocumento(c.getTipoDocumento());
            cDto.setNumeroDocumento(c.getNumeroDocumento());
            cDto.setNombresORazonSocial(c.getNombresORazonSocial());
            dto.setCliente(cDto);
        }

        if (d.getDetalles() != null) {
            dto.setDetalles(d.getDetalles().stream().map(det -> {
                DetalleNotaCreditoDto detDto = new DetalleNotaCreditoDto();
                detDto.setId(det.getId());
                detDto.setProductoId(det.getProductoId());
                detDto.setNombreProducto(det.getNombreProducto());
                detDto.setLoteId(det.getLoteId());
                detDto.setNumeroLote(det.getNumeroLote());
                detDto.setCantidadDevuelta(det.getCantidad());
                detDto.setPrecioUnitario(det.getPrecioUnitario());
                detDto.setSubtotal(det.getMontoReembolsado());
                detDto.setReingresaAStock(det.getReingresaAStock());
                return detDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
