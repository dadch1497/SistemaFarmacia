package pe.farmagest.catalogo.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CatalogoEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(CatalogoEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    @Value("${farmagest.rabbitmq.exchange:farmagest.events}")
    private String exchangeName;

    public CatalogoEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publicarPrecioCambiado(PrecioCambiadoEvent event) {
        final String routingKey = "catalogo.precio-cambiado";
        try {
            rabbitTemplate.convertAndSend(exchangeName, routingKey, event);
            log.info("Evento '{}' publicado exitosamente para producto ID: {}", routingKey, event.getPayload().getProductoId());
        } catch (Exception e) {
            log.error("Error al publicar evento '{}' en RabbitMQ: {}", routingKey, e.getMessage(), e);
        }
    }
}
