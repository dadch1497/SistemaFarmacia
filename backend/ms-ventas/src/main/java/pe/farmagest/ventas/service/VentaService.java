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

    public VentaService(VentaRepository ventaRepository,
                        DetalleVentaRepository detalleVentaRepository,
                        SesionCajaRepository sesionCajaRepository,
                        ClienteRepository clienteRepository,
                        PromocionRepository promocionRepository,
                        CuponRepository cuponRepository,
                        VentaEsperaRepository ventaEsperaRepository,
                        PromocionService promocionService,
                        VentasEventPublisher eventPublisher) {
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.sesionCajaRepository = sesionCajaRepository;
        this.clienteRepository = clienteRepository;
        this.promocionRepository = promocionRepository;
        this.cuponRepository = cuponRepository;
        this.ventaEsperaRepository = ventaEsperaRepository;
        this.promocionService = promocionService;
        this.eventPublisher = eventPublisher;
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
}
