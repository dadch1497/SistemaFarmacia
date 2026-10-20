package pe.farmagest.ventas.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import pe.farmagest.ventas.config.RabbitMqConfig;
import pe.farmagest.ventas.entity.Devolucion;
import pe.farmagest.ventas.entity.Venta;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class VentasEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(VentasEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public VentasEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publicarVentaRegistrada(Venta venta) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "venta.registrada");
        event.put("timestamp", LocalDateTime.now().toString());
        event.put("sourceService", "ms-ventas");
        event.put("ventaId", venta.getId());
        event.put("sucursalId", venta.getSucursalId());
        event.put("numeroComprobante", venta.getSerieComprobante() + "-" + venta.getNumeroComprobante());
        event.put("tipoComprobante", venta.getTipoComprobante().name());
        event.put("usuarioId", venta.getUsuarioVendedorId());
        event.put("total", venta.getTotal());
        event.put("medioPago", venta.getMedioPago().name());

        List<Map<String, Object>> items = new ArrayList<>();
        if (venta.getDetalles() != null) {
            for (var d : venta.getDetalles()) {
                Map<String, Object> it = new HashMap<>();
                it.put("productoId", d.getProductoId());
                it.put("loteId", d.getLoteId());
                it.put("cantidad", d.getCantidad());
                it.put("precioUnitario", d.getPrecioUnitario());
                it.put("subtotalLinea", d.getSubtotalLinea());
                items.add(it);
            }
        }
        event.put("items", items);

        log.info("Publicando evento [{}] para venta ID {}", RabbitMqConfig.ROUTING_KEY_VENTA_REGISTRADA, venta.getId());
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_EVENTS, RabbitMqConfig.ROUTING_KEY_VENTA_REGISTRADA, event);
    }

    public void publicarVentaAnulada(Venta venta, String motivo, Long usuarioId) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "venta.anulada");
        event.put("timestamp", LocalDateTime.now().toString());
        event.put("sourceService", "ms-ventas");
        event.put("ventaId", venta.getId());
        event.put("sucursalId", venta.getSucursalId());
        event.put("referenciaId", venta.getSerieComprobante() + "-" + venta.getNumeroComprobante());
        event.put("usuarioId", usuarioId);
        event.put("motivo", motivo);

        List<Map<String, Object>> items = new ArrayList<>();
        if (venta.getDetalles() != null) {
            for (var d : venta.getDetalles()) {
                Map<String, Object> it = new HashMap<>();
                it.put("productoId", d.getProductoId());
                it.put("loteId", d.getLoteId());
                it.put("cantidad", d.getCantidad());
                items.add(it);
            }
        }
        event.put("items", items);

        log.info("Publicando evento [{}] para anulación de venta ID {}", RabbitMqConfig.ROUTING_KEY_VENTA_ANULADA, venta.getId());
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_EVENTS, RabbitMqConfig.ROUTING_KEY_VENTA_ANULADA, event);
    }

    public void publicarDevolucionRegistrada(Devolucion devolucion) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "devolucion.registrada");
        event.put("timestamp", LocalDateTime.now().toString());
        event.put("sourceService", "ms-ventas");
        event.put("devolucionId", devolucion.getId());
        event.put("ventaId", devolucion.getVenta().getId());
        event.put("sucursalId", devolucion.getSucursalId());
        event.put("referenciaId", "DEV-" + devolucion.getId());
        event.put("usuarioId", devolucion.getUsuarioId());
        event.put("motivo", devolucion.getMotivo());

        List<Map<String, Object>> items = new ArrayList<>();
        if (devolucion.getDetalles() != null) {
            for (var d : devolucion.getDetalles()) {
                Map<String, Object> it = new HashMap<>();
                it.put("productoId", d.getProductoId());
                it.put("loteId", d.getLoteId());
                it.put("cantidad", d.getCantidad());
                items.add(it);
            }
        }
        event.put("items", items);

        log.info("Publicando evento [{}] para devolución ID {}", RabbitMqConfig.ROUTING_KEY_DEVOLUCION_REGISTRADA, devolucion.getId());
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_EVENTS, RabbitMqConfig.ROUTING_KEY_DEVOLUCION_REGISTRADA, event);
    }
}
