package pe.farmagest.inventario.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import pe.farmagest.inventario.config.RabbitMqConfig;
import pe.farmagest.inventario.dto.DespachoFefoRequest;
import pe.farmagest.inventario.service.InventarioService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
public class InventarioEventListener {

    private static final Logger log = LoggerFactory.getLogger(InventarioEventListener.class);

    private final InventarioService inventarioService;

    public InventarioEventListener(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    /**
     * Consume venta.registrada y descuenta automáticamente por FEFO
     */
    @RabbitListener(queues = RabbitMqConfig.QUEUE_VENTA_REGISTRADA)
    public void onVentaRegistrada(Map<String, Object> event) {
        log.info("Evento [venta.registrada] recibido: {}", event);
        try {
            Long ventaId = getLongValue(event.get("ventaId"));
            Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
            String comprobante = (String) event.get("numeroComprobante");
            Long usuarioId = getLongValue(event.get("usuarioId"), 1L);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) event.get("items");

            if (items != null) {
                for (Map<String, Object> item : items) {
                    Long productoId = getLongValue(item.get("productoId"));
                    Integer cantidad = getIntegerValue(item.get("cantidad"));

                    if (productoId != null && cantidad != null && cantidad > 0) {
                        DespachoFefoRequest req = new DespachoFefoRequest(productoId, sucursalId, cantidad, ventaId, comprobante);
                        inventarioService.despacharFefo(req, usuarioId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error procesando evento venta.registrada: {}", e.getMessage(), e);
            throw new RuntimeException(e); // Send to DLQ
        }
    }

    /**
     * Consume venta.anulada o devolucion.registrada y repone el stock
     */
    @RabbitListener(queues = RabbitMqConfig.QUEUE_VENTA_ANULADA)
    public void onVentaAnuladaODevolucion(Map<String, Object> event) {
        log.info("Evento [venta.anulada / devolucion] recibido: {}", event);
        try {
            Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
            Long usuarioId = getLongValue(event.get("usuarioId"), 1L);
            String referencia = (String) event.get("referenciaId");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) event.get("items");

            if (items != null) {
                for (Map<String, Object> item : items) {
                    Long productoId = getLongValue(item.get("productoId"));
                    Long loteId = getLongValue(item.get("loteId"));
                    Integer cantidad = getIntegerValue(item.get("cantidad"));

                    if (productoId != null && loteId != null && cantidad != null && cantidad > 0) {
                        inventarioService.reponerStockPorVentaAnulada(productoId, loteId, cantidad, sucursalId, referencia, usuarioId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error procesando reposición de stock: {}", e.getMessage(), e);
            throw new RuntimeException(e); // Send to DLQ
        }
    }

    /**
     * Consume compra.ingreso-registrado y suma el lote y stock
     */
    @RabbitListener(queues = RabbitMqConfig.QUEUE_COMPRA_INGRESO)
    public void onCompraIngreso(Map<String, Object> event) {
        log.info("Evento [compra.ingreso-registrado] recibido: {}", event);
        try {
            Integer sucursalId = getIntegerValue(event.get("sucursalId"), 1);
            Long usuarioId = getLongValue(event.get("usuarioId"), 1L);
            String referencia = (String) event.get("numeroGuia");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) event.get("items");

            if (items != null) {
                for (Map<String, Object> item : items) {
                    Long productoId = getLongValue(item.get("productoId"));
                    String numeroLote = (String) item.get("numeroLote");
                    String fechaVenc = (String) item.get("fechaVencimiento");
                    Integer cantidad = getIntegerValue(item.get("cantidadRecibida"));
                    BigDecimal costo = item.get("costoUnitario") != null
                            ? new BigDecimal(item.get("costoUnitario").toString())
                            : BigDecimal.ZERO;

                    if (productoId != null && numeroLote != null && cantidad != null && cantidad > 0) {
                        LocalDate vencimiento = LocalDate.parse(fechaVenc);
                        inventarioService.ingresarLotePorCompra(
                                productoId, numeroLote, vencimiento, cantidad, costo, sucursalId, referencia, usuarioId
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error procesando ingreso de mercadería: {}", e.getMessage(), e);
            throw new RuntimeException(e); // Send to DLQ
        }
    }

    private Long getLongValue(Object obj) {
        return getLongValue(obj, null);
    }

    private Long getLongValue(Object obj, Long defaultVal) {
        if (obj == null) return defaultVal;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try {
            return Long.parseLong(obj.toString());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private Integer getIntegerValue(Object obj) {
        return getIntegerValue(obj, null);
    }

    private Integer getIntegerValue(Object obj, Integer defaultVal) {
        if (obj == null) return defaultVal;
        if (obj instanceof Number) return ((Number) obj).intValue();
        try {
            return Integer.parseInt(obj.toString());
        } catch (Exception e) {
            return defaultVal;
        }
    }
}
