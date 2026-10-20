package pe.farmagest.inventario.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import pe.farmagest.inventario.config.RabbitMqConfig;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class InventarioEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(InventarioEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public InventarioEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void emitirStockBajo(Long productoId, Integer stockActual, Integer stockMinimo, Integer sucursalId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("evento", "STOCK_BAJO");
            payload.put("productoId", productoId);
            payload.put("stockActual", stockActual);
            payload.put("stockMinimo", stockMinimo);
            payload.put("sucursalId", sucursalId);
            payload.put("fechaHora", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.EXCHANGE_EVENTS,
                    RabbitMqConfig.ROUTING_KEY_STOCK_BAJO,
                    payload
            );
            log.info("Evento [inventario.stock-bajo] publicado para producto {}: stock={}/{}", productoId, stockActual, stockMinimo);
        } catch (Exception e) {
            log.error("Error publicando evento inventario.stock-bajo: {}", e.getMessage());
        }
    }

    public void emitirLotePorVencer(Long loteId, Long productoId, String numeroLote, String fechaVencimiento,
                                    Long diasRestantes, Integer cantidadActual, Integer sucursalId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("evento", "LOTE_POR_VENCER");
            payload.put("loteId", loteId);
            payload.put("productoId", productoId);
            payload.put("numeroLote", numeroLote);
            payload.put("fechaVencimiento", fechaVencimiento);
            payload.put("diasRestantes", diasRestantes);
            payload.put("cantidadActual", cantidadActual);
            payload.put("sucursalId", sucursalId);
            payload.put("fechaHora", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.EXCHANGE_EVENTS,
                    RabbitMqConfig.ROUTING_KEY_LOTE_VENCER,
                    payload
            );
            log.info("Evento [inventario.lote-por-vencer] publicado para lote {} ({} dias restantes)", numeroLote, diasRestantes);
        } catch (Exception e) {
            log.error("Error publicando evento inventario.lote-por-vencer: {}", e.getMessage());
        }
    }
}
