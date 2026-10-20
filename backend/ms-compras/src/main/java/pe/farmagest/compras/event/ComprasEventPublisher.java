package pe.farmagest.compras.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import pe.farmagest.compras.config.RabbitMqConfig;
import pe.farmagest.compras.entity.DetalleIngreso;
import pe.farmagest.compras.entity.IngresoMercaderia;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ComprasEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ComprasEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public ComprasEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void emitirIngresoRegistrado(IngresoMercaderia ingreso) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("evento", "INGRESO_COMPRA");
            payload.put("ingresoId", ingreso.getId());
            payload.put("ordenCompraId", ingreso.getOrdenCompra() != null ? ingreso.getOrdenCompra().getId() : null);
            payload.put("sucursalId", ingreso.getSucursalId());
            payload.put("numeroGuia", ingreso.getNumeroGuia());
            payload.put("numeroFactura", ingreso.getNumeroFacturaProveedor());
            payload.put("usuarioId", ingreso.getUsuarioRecepcionId());
            payload.put("fechaRecepcion", ingreso.getFechaRecepcion() != null ? ingreso.getFechaRecepcion().toString() : LocalDateTime.now().toString());

            List<Map<String, Object>> itemsList = new ArrayList<>();
            for (DetalleIngreso det : ingreso.getDetalles()) {
                Map<String, Object> item = new HashMap<>();
                item.put("productoId", det.getProductoId());
                item.put("numeroLote", det.getNumeroLote());
                item.put("fechaVencimiento", det.getFechaVencimiento().toString());
                item.put("cantidadRecibida", det.getCantidadRecibida());
                item.put("costoUnitario", det.getCostoUnitarioReal());
                itemsList.add(item);
            }
            payload.put("items", itemsList);

            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.EXCHANGE_EVENTS,
                    RabbitMqConfig.ROUTING_KEY_COMPRA_INGRESO,
                    payload
            );
            log.info("Evento [compra.ingreso-registrado] publicado para Guía {}: {} medicamentos recibidos",
                    ingreso.getNumeroGuia(), itemsList.size());
        } catch (Exception e) {
            log.error("Error publicando evento compra.ingreso-registrado: {}", e.getMessage(), e);
        }
    }
}
