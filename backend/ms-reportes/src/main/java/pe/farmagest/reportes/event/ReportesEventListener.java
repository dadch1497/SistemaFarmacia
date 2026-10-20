package pe.farmagest.reportes.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.reportes.config.RabbitMqConfig;
import pe.farmagest.reportes.entity.*;
import pe.farmagest.reportes.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class ReportesEventListener {

    private static final Logger log = LoggerFactory.getLogger(ReportesEventListener.class);

    private final ResumenVentaDiariaRepository resumenVentaRepo;
    private final MetricaProductoDiariaRepository metricaProductoRepo;
    private final MetricaVendedorDiariaRepository metricaVendedorRepo;
    private final MetricaPagoDiariaRepository metricaPagoRepo;
    private final LogAuditoriaRepository logAuditoriaRepo;

    public ReportesEventListener(ResumenVentaDiariaRepository resumenVentaRepo,
                                 MetricaProductoDiariaRepository metricaProductoRepo,
                                 MetricaVendedorDiariaRepository metricaVendedorRepo,
                                 MetricaPagoDiariaRepository metricaPagoRepo,
                                 LogAuditoriaRepository logAuditoriaRepo) {
        this.resumenVentaRepo = resumenVentaRepo;
        this.metricaProductoRepo = metricaProductoRepo;
        this.metricaVendedorRepo = metricaVendedorRepo;
        this.metricaPagoRepo = metricaPagoRepo;
        this.logAuditoriaRepo = logAuditoriaRepo;
    }

    @Transactional
    @RabbitListener(queues = RabbitMqConfig.QUEUE_REPORTES_EVENTOS)
    public void procesarEvento(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        log.info("ms-reportes capturó evento: [{}] -> {}", eventType, event.get("eventId"));

        if (eventType == null) return;

        try {
            switch (eventType) {
                case "venta.registrada" -> procesarVentaRegistrada(event);
                case "venta.anulada" -> procesarVentaAnulada(event);
                case "catalogo.precio-cambiado" -> procesarPrecioCambiado(event);
                case "inventario.stock-bajo" -> procesarAlertaStock(event);
                case "compra.ingreso-registrado" -> procesarIngresoCompra(event);
                default -> log.debug("Evento no mapeado explícitamente en ms-reportes: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error en ms-reportes procesando evento {}: {}", eventType, e.getMessage(), e);
            throw new RuntimeException(e); // Trigger DLQ
        }
    }

    private void procesarVentaRegistrada(Map<String, Object> event) {
        Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
        LocalDate fecha = LocalDate.now();
        BigDecimal total = getBigDecimalValue(event.get("total"), BigDecimal.ZERO);
        String medioPago = (String) event.get("medioPago");
        Long usuarioId = getLongValue(event.get("usuarioId"), 1L);
        String nombreVendedor = (String) event.get("nombreVendedor");
        final String vendedorFinal = (nombreVendedor != null) ? nombreVendedor : ("Vendedor #" + usuarioId);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) event.get("items");

        // 1. Actualizar Resumen Diario
        ResumenVentaDiaria resumen = resumenVentaRepo.findBySucursalIdAndFecha(sucursalId, fecha)
                .orElseGet(() -> new ResumenVentaDiaria(sucursalId, fecha));

        resumen.setTotalVentas(resumen.getTotalVentas().add(total));
        resumen.setCantidadTransacciones(resumen.getCantidadTransacciones() + 1);

        int totalUnidadesEnVenta = 0;
        BigDecimal costoTotalVenta = BigDecimal.ZERO;

        if (items != null) {
            for (Map<String, Object> it : items) {
                Long prodId = getLongValue(it.get("productoId"));
                int cant = getIntegerValue(it.get("cantidad"), 0);
                BigDecimal precioUnit = getBigDecimalValue(it.get("precioUnitario"), BigDecimal.ZERO);
                BigDecimal subtotalLinea = getBigDecimalValue(it.get("subtotalLinea"), precioUnit.multiply(BigDecimal.valueOf(cant)));

                totalUnidadesEnVenta += cant;

                // Actualizar métrica de producto
                MetricaProductoDiaria metricaProd = metricaProductoRepo.findBySucursalIdAndFechaAndProductoId(sucursalId, fecha, prodId)
                        .orElseGet(() -> new MetricaProductoDiaria(sucursalId, fecha, prodId, "Producto #" + prodId));

                metricaProd.setUnidadesVendidas(metricaProd.getUnidadesVendidas() + cant);
                metricaProd.setMontoVendido(metricaProd.getMontoVendido().add(subtotalLinea));
                metricaProductoRepo.save(metricaProd);
            }
        }

        resumen.setTotalUnidadesVendidas(resumen.getTotalUnidadesVendidas() + totalUnidadesEnVenta);
        if (resumen.getCantidadTransacciones() > 0) {
            resumen.setTicketPromedio(resumen.getTotalVentas().divide(BigDecimal.valueOf(resumen.getCantidadTransacciones()), 2, RoundingMode.HALF_UP));
        }
        resumen.setActualizadoEn(LocalDateTime.now());
        resumenVentaRepo.save(resumen);

        // 2. Actualizar Métrica de Vendedor
        MetricaVendedorDiaria metricaVend = metricaVendedorRepo.findBySucursalIdAndFechaAndUsuarioId(sucursalId, fecha, usuarioId)
                .orElseGet(() -> new MetricaVendedorDiaria(sucursalId, fecha, usuarioId, vendedorFinal));
        metricaVend.setMontoTotal(metricaVend.getMontoTotal().add(total));
        metricaVend.setTotalVentas(metricaVend.getTotalVentas() + 1);
        metricaVendedorRepo.save(metricaVend);

        // 3. Actualizar Métrica de Medio de Pago
        if (medioPago != null) {
            MetricaPagoDiaria metricaPago = metricaPagoRepo.findBySucursalIdAndFechaAndMedioPago(sucursalId, fecha, medioPago)
                    .orElseGet(() -> new MetricaPagoDiaria(sucursalId, fecha, medioPago));
            metricaPago.setMontoTotal(metricaPago.getMontoTotal().add(total));
            metricaPago.setTotalTransacciones(metricaPago.getTotalTransacciones() + 1);
            metricaPagoRepo.save(metricaPago);
        }
    }

    private void procesarVentaAnulada(Map<String, Object> event) {
        Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
        Long usuarioId = getLongValue(event.get("usuarioId"), 1L);
        String comprobante = (String) event.get("numeroComprobante");
        String motivo = (String) event.get("motivo");

        // Registrar en Auditoría Inmutable
        LogAuditoria audit = new LogAuditoria(
                sucursalId,
                usuarioId,
                "admin",
                "ROLE_ADMINISTRADOR",
                "VENTA_ANULADA",
                "VENTA",
                comprobante != null ? comprobante : "ID-" + event.get("ventaId"),
                "{\"estado\":\"COMPLETADA\"}",
                "{\"estado\":\"ANULADA\",\"motivo\":\"" + motivo + "\"}",
                "RabbitMQ"
        );
        logAuditoriaRepo.save(audit);
    }

    private void procesarPrecioCambiado(Map<String, Object> event) {
        Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
        Long usuarioId = getLongValue(event.get("usuarioId"), 1L);
        String prodId = String.valueOf(event.get("productoId"));

        LogAuditoria audit = new LogAuditoria(
                sucursalId,
                usuarioId,
                "admin",
                "ROLE_ADMINISTRADOR",
                "CAMBIO_PRECIO",
                "PRODUCTO",
                prodId,
                "{\"precioAnterior\":" + event.get("precioAnterior") + "}",
                "{\"precioNuevo\":" + event.get("precioNuevo") + ",\"motivo\":\"" + event.get("motivo") + "\"}",
                "RabbitMQ"
        );
        logAuditoriaRepo.save(audit);
    }

    private void procesarAlertaStock(Map<String, Object> event) {
        Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
        Long prodId = getLongValue(event.get("productoId"), 1L);

        LogAuditoria audit = new LogAuditoria(
                sucursalId,
                1L,
                "sistema",
                "ROLE_SISTEMA",
                "STOCK_BAJO",
                "PRODUCTO",
                String.valueOf(prodId),
                null,
                "{\"alerta\":\"Stock por debajo del mínimo permitido\"}",
                "RabbitMQ"
        );
        logAuditoriaRepo.save(audit);
    }

    private void procesarIngresoCompra(Map<String, Object> event) {
        Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
        Long usuarioId = getLongValue(event.get("usuarioId"), 1L);
        String factura = (String) event.get("numeroFacturaProveedor");

        LogAuditoria audit = new LogAuditoria(
                sucursalId,
                usuarioId,
                "almacenero",
                "ROLE_ALMACENERO",
                "INGRESO_MERCADERIA",
                "COMPRA",
                factura != null ? factura : "COMPRA-" + event.get("compraId"),
                null,
                "{\"total\":" + event.get("total") + "}",
                "RabbitMQ"
        );
        logAuditoriaRepo.save(audit);
    }

    private Integer getIntegerValue(Object val, int def) {
        if (val instanceof Number) return ((Number) val).intValue();
        return def;
    }

    private Long getLongValue(Object val, Long def) {
        if (val instanceof Number) return ((Number) val).longValue();
        return def;
    }

    private Long getLongValue(Object val) {
        return getLongValue(val, null);
    }

    private BigDecimal getBigDecimalValue(Object val, BigDecimal def) {
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        if (val instanceof String) {
            try { return new BigDecimal((String) val); } catch (Exception ignored) {}
        }
        return def;
    }
}
