package pe.farmagest.inventario.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.inventario.dto.*;
import pe.farmagest.inventario.entity.*;
import pe.farmagest.inventario.event.InventarioEventPublisher;
import pe.farmagest.inventario.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioService {

    private static final Logger log = LoggerFactory.getLogger(InventarioService.class);

    private final ProductoStockRepository productoStockRepository;
    private final LoteRepository loteRepository;
    private final MovimientoKardexRepository kardexRepository;
    private final AlertaInventarioRepository alertaRepository;
    private final InventarioEventPublisher eventPublisher;

    public InventarioService(
            ProductoStockRepository productoStockRepository,
            LoteRepository loteRepository,
            MovimientoKardexRepository kardexRepository,
            AlertaInventarioRepository alertaRepository,
            InventarioEventPublisher eventPublisher
    ) {
        this.productoStockRepository = productoStockRepository;
        this.loteRepository = loteRepository;
        this.kardexRepository = kardexRepository;
        this.alertaRepository = alertaRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<StockProductoResponse> listarStock(Integer sucursalId) {
        return productoStockRepository.findBySucursalId(sucursalId).stream()
                .map(this::mapToStockResponse)
                .collect(Collectors.toList());
    }

    public StockProductoResponse obtenerStockPorProducto(Long productoId, Integer sucursalId) {
        return productoStockRepository.findByProductoIdAndSucursalId(productoId, sucursalId)
                .map(this::mapToStockResponse)
                .orElseGet(() -> new StockProductoResponse(null, productoId, sucursalId, 0, 10, 100, LocalDateTime.now()));
    }

    public List<StockProductoResponse> listarStockBajo(Integer sucursalId) {
        return productoStockRepository.findStockBajo(sucursalId).stream()
                .map(this::mapToStockResponse)
                .collect(Collectors.toList());
    }

    public List<LoteResponse> listarLotesPorProducto(Long productoId, Integer sucursalId) {
        return loteRepository.findByProductoIdAndSucursalIdOrderByFechaVencimientoAsc(productoId, sucursalId).stream()
                .map(this::mapToLoteResponse)
                .collect(Collectors.toList());
    }

    public List<LoteResponse> listarLotesPorVencer(int dias, Integer sucursalId) {
        LocalDate fechaLimite = LocalDate.now().plusDays(dias);
        return loteRepository.findLotesPorVencer(sucursalId, fechaLimite).stream()
                .map(this::mapToLoteResponse)
                .collect(Collectors.toList());
    }

    public List<KardexResponse> listarKardexPorProducto(Long productoId, Integer sucursalId) {
        return kardexRepository.findByProductoIdAndSucursalIdOrderByFechaHoraDesc(productoId, sucursalId).stream()
                .map(this::mapToKardexResponse)
                .collect(Collectors.toList());
    }

    public List<AlertaResponse> listarAlertas(Integer sucursalId) {
        return alertaRepository.findBySucursalIdAndAtendidaFalseOrderByNivelUrgenciaDescFechaAlertaDesc(sucursalId).stream()
                .map(this::mapToAlertaResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void atenderAlerta(Long alertaId) {
        alertaRepository.findById(alertaId).ifPresent(alerta -> {
            alerta.setAtendida(true);
            alertaRepository.save(alerta);
        });
    }

    /**
     * Registro de Ajuste de Stock / Merma con auditoría y Kardex
     */
    @Transactional
    public KardexResponse registrarAjuste(AjusteStockRequest request, Long usuarioId) {
        Lote lote = loteRepository.findById(request.getLoteId())
                .orElseThrow(() -> new IllegalArgumentException("Lote no encontrado con ID: " + request.getLoteId()));

        if (!lote.getProductoId().equals(request.getProductoId())) {
            throw new IllegalArgumentException("El lote no corresponde al producto especificado");
        }

        ProductoStock stock = productoStockRepository.findByProductoIdAndSucursalId(request.getProductoId(), request.getSucursalId())
                .orElseGet(() -> {
                    ProductoStock nuevo = new ProductoStock(request.getProductoId(), request.getSucursalId(), 0, 10, 100);
                    return productoStockRepository.save(nuevo);
                });

        int cantidadDelta;
        if (request.getTipoAjuste() == TipoMovimiento.AJUSTE_MERMA || request.getTipoAjuste() == TipoMovimiento.AJUSTE_VENCIMIENTO) {
            if (lote.getCantidadActual() < request.getCantidad()) {
                throw new IllegalArgumentException("La cantidad a mermar (" + request.getCantidad() + ") supera el stock del lote (" + lote.getCantidadActual() + ")");
            }
            cantidadDelta = -request.getCantidad();
        } else if (request.getTipoAjuste() == TipoMovimiento.AJUSTE_SOBRANTE) {
            cantidadDelta = request.getCantidad();
        } else {
            throw new IllegalArgumentException("Tipo de ajuste no válido: " + request.getTipoAjuste());
        }

        // Aplicar a lote
        lote.setCantidadActual(lote.getCantidadActual() + cantidadDelta);
        loteRepository.save(lote);

        // Aplicar a ProductoStock consolidado
        int nuevoStock = Math.max(0, stock.getStockActual() + cantidadDelta);
        stock.setStockActual(nuevoStock);
        productoStockRepository.save(stock);

        // Registrar en Kardex
        MovimientoKardex kardex = new MovimientoKardex(
                request.getProductoId(),
                lote,
                request.getSucursalId(),
                request.getTipoAjuste(),
                cantidadDelta,
                nuevoStock,
                "AJUSTE_MANUAL",
                "AJU-" + System.currentTimeMillis(),
                request.getMotivo(),
                usuarioId
        );
        kardex = kardexRepository.save(kardex);

        // Verificar si detonó stock bajo
        if (nuevoStock <= stock.getStockMinimo()) {
            crearAlertaStockBajo(stock);
        }

        return mapToKardexResponse(kardex);
    }

    /**
     * Algoritmo FEFO: First Expired, First Out
     * Consume las unidades requeridas de los lotes más próximos a caducar.
     */
    @Transactional
    public DespachoFefoRequest.DespachoResult despacharFefo(DespachoFefoRequest request, Long usuarioId) {
        Long productoId = request.getProductoId();
        Integer sucursalId = request.getSucursalId();
        int requerido = request.getCantidad();

        ProductoStock stock = productoStockRepository.findByProductoIdAndSucursalId(productoId, sucursalId)
                .orElseThrow(() -> new IllegalStateException("No existe registro de stock para el producto " + productoId));

        if (stock.getStockActual() < requerido) {
            throw new IllegalStateException("Stock insuficiente: se solicitó " + requerido + " pero solo hay " + stock.getStockActual());
        }

        List<Lote> lotesFefo = loteRepository.findLotesParaDespachoFefo(productoId, sucursalId, EstadoLote.DISPONIBLE);
        if (lotesFefo.isEmpty()) {
            throw new IllegalStateException("No se encontraron lotes disponibles con fecha de vencimiento vigente para despachar");
        }

        DespachoFefoRequest.DespachoResult result = new DespachoFefoRequest.DespachoResult(productoId, requerido, 0, 0);
        int restante = requerido;

        for (Lote lote : lotesFefo) {
            if (restante <= 0) break;

            int disponibleEnLote = lote.getCantidadActual();
            int aTomar = Math.min(disponibleEnLote, restante);

            lote.setCantidadActual(disponibleEnLote - aTomar);
            loteRepository.save(lote);

            result.getItems().add(new DespachoFefoRequest.DespachoItem(
                    lote.getId(),
                    lote.getNumeroLote(),
                    aTomar,
                    lote.getCostoUnitario()
            ));

            restante -= aTomar;
        }

        if (restante > 0) {
            throw new IllegalStateException("Error en FEFO: los lotes activos no cubren la cantidad requerida");
        }

        // Actualizar stock consolidado
        int nuevoStock = stock.getStockActual() - requerido;
        stock.setStockActual(nuevoStock);
        productoStockRepository.save(stock);
        result.setCantidadDespachada(requerido);
        result.setStockRemanente(nuevoStock);

        // Kardex por cada lote afectado
        for (DespachoFefoRequest.DespachoItem item : result.getItems()) {
            Lote lote = loteRepository.findById(item.getLoteId()).orElse(null);
            MovimientoKardex k = new MovimientoKardex(
                    productoId,
                    lote,
                    sucursalId,
                    TipoMovimiento.SALIDA_VENTA,
                    -item.getCantidadTomada(),
                    nuevoStock,
                    "VENTA",
                    request.getNumeroComprobante() != null ? request.getNumeroComprobante() : "V-" + request.getVentaId(),
                    "Despacho POS vía FEFO",
                    usuarioId
            );
            kardexRepository.save(k);
        }

        // Verificar alerta de stock bajo
        if (nuevoStock <= stock.getStockMinimo()) {
            crearAlertaStockBajo(stock);
        }

        return result;
    }

    /**
     * Reposición de stock por anulación de venta o devolución
     */
    @Transactional
    public void reponerStockPorVentaAnulada(Long productoId, Long loteId, Integer cantidad, Integer sucursalId,
                                           String referenciaId, Long usuarioId) {
        Lote lote = loteRepository.findById(loteId)
                .orElseThrow(() -> new IllegalArgumentException("Lote no encontrado: " + loteId));

        lote.setCantidadActual(lote.getCantidadActual() + cantidad);
        loteRepository.save(lote);

        ProductoStock stock = productoStockRepository.findByProductoIdAndSucursalId(productoId, sucursalId)
                .orElseGet(() -> productoStockRepository.save(new ProductoStock(productoId, sucursalId, 0, 10, 100)));

        stock.setStockActual(stock.getStockActual() + cantidad);
        productoStockRepository.save(stock);

        MovimientoKardex k = new MovimientoKardex(
                productoId,
                lote,
                sucursalId,
                TipoMovimiento.DEVOLUCION_CLIENTE,
                cantidad,
                stock.getStockActual(),
                "VENTA_ANULADA",
                referenciaId,
                "Reposición por anulación o devolución",
                usuarioId
        );
        kardexRepository.save(k);
        log.info("Stock repuesto en lote {}: +{} unidades. Saldo: {}", lote.getNumeroLote(), cantidad, stock.getStockActual());
    }

    /**
     * Ingreso de mercadería por compra de lote
     */
    @Transactional
    public void ingresarLotePorCompra(Long productoId, String numeroLote, LocalDate fechaVencimiento,
                                      Integer cantidad, BigDecimal costoUnitario, Integer sucursalId,
                                      String referenciaId, Long usuarioId) {
        Lote lote = loteRepository.findByProductoIdAndNumeroLoteAndSucursalId(productoId, numeroLote, sucursalId)
                .orElseGet(() -> new Lote(productoId, sucursalId, numeroLote, fechaVencimiento, 0, 0, costoUnitario));

        lote.setCantidadInicial(lote.getCantidadInicial() + cantidad);
        lote.setCantidadActual(lote.getCantidadActual() + cantidad);
        lote.setCostoUnitario(costoUnitario);
        lote.setFechaVencimiento(fechaVencimiento);
        lote = loteRepository.save(lote);

        ProductoStock stock = productoStockRepository.findByProductoIdAndSucursalId(productoId, sucursalId)
                .orElseGet(() -> productoStockRepository.save(new ProductoStock(productoId, sucursalId, 0, 10, 100)));

        stock.setStockActual(stock.getStockActual() + cantidad);
        productoStockRepository.save(stock);

        MovimientoKardex k = new MovimientoKardex(
                productoId,
                lote,
                sucursalId,
                TipoMovimiento.INGRESO_COMPRA,
                cantidad,
                stock.getStockActual(),
                "COMPRA",
                referenciaId,
                "Recepción de mercadería en almacén",
                usuarioId
        );
        kardexRepository.save(k);
        log.info("Ingreso de mercadería registrado: Producto {}, Lote {}, +{} unidades.", productoId, numeroLote, cantidad);
    }

    private void crearAlertaStockBajo(ProductoStock stock) {
        String msg = "Stock actual (" + stock.getStockActual() + ") por debajo o igual al mínimo de seguridad (" + stock.getStockMinimo() + ")";
        AlertaInventario alerta = new AlertaInventario(
                stock.getProductoId(),
                null,
                stock.getSucursalId(),
                TipoAlerta.STOCK_MINIMO,
                msg,
                stock.getStockActual() == 0 ? 3 : 2
        );
        alertaRepository.save(alerta);
        eventPublisher.emitirStockBajo(stock.getProductoId(), stock.getStockActual(), stock.getStockMinimo(), stock.getSucursalId());
    }

    // Mappers
    private StockProductoResponse mapToStockResponse(ProductoStock ps) {
        return new StockProductoResponse(
                ps.getId(),
                ps.getProductoId(),
                ps.getSucursalId(),
                ps.getStockActual(),
                ps.getStockMinimo(),
                ps.getStockMaximo(),
                ps.getActualizadoEn()
        );
    }

    private LoteResponse mapToLoteResponse(Lote l) {
        return new LoteResponse(
                l.getId(),
                l.getProductoId(),
                l.getSucursalId(),
                l.getNumeroLote(),
                l.getFechaVencimiento(),
                l.getCantidadInicial(),
                l.getCantidadActual(),
                l.getCostoUnitario(),
                l.getEstado()
        );
    }

    private KardexResponse mapToKardexResponse(MovimientoKardex k) {
        return new KardexResponse(
                k.getId(),
                k.getProductoId(),
                k.getLote() != null ? k.getLote().getId() : null,
                k.getLote() != null ? k.getLote().getNumeroLote() : null,
                k.getSucursalId(),
                k.getTipoMovimiento(),
                k.getCantidad(),
                k.getSaldoResultante(),
                k.getReferenciaTipo(),
                k.getReferenciaId(),
                k.getMotivo(),
                k.getUsuarioId(),
                k.getFechaHora()
        );
    }

    private AlertaResponse mapToAlertaResponse(AlertaInventario a) {
        return new AlertaResponse(
                a.getId(),
                a.getProductoId(),
                a.getLote() != null ? a.getLote().getId() : null,
                a.getLote() != null ? a.getLote().getNumeroLote() : null,
                a.getSucursalId(),
                a.getTipoAlerta(),
                a.getMensaje(),
                a.getNivelUrgencia(),
                a.getAtendida(),
                a.getFechaAlerta()
        );
    }
}
