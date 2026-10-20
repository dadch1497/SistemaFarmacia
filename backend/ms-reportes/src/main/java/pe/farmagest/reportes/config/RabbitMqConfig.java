package pe.farmagest.reportes.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String EXCHANGE_EVENTS = "farmagest.events";
    public static final String EXCHANGE_DLX = "farmagest.dlx";
    public static final String QUEUE_DLQ = "q.farmagest.dlq";
    public static final String ROUTING_KEY_DLQ = "farmagest.dead-letter";

    // Cola exclusiva de ms-reportes para capturar todos los eventos de dominio
    public static final String QUEUE_REPORTES_EVENTOS = "q.reportes.eventos";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(EXCHANGE_EVENTS, true, false);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(EXCHANGE_DLX, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(QUEUE_DLQ).build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(ROUTING_KEY_DLQ);
    }

    @Bean
    public Queue reportesEventosQueue() {
        return QueueBuilder.durable(QUEUE_REPORTES_EVENTOS)
                .withArgument("x-dead-letter-exchange", EXCHANGE_DLX)
                .withArgument("x-dead-letter-routing-key", ROUTING_KEY_DLQ)
                .build();
    }

    // Bindings para que ms-reportes reciba ventas, compras, inventario y catalogo
    @Bean
    public Binding bindingVentasReportes() {
        return BindingBuilder.bind(reportesEventosQueue()).to(eventsExchange()).with("venta.*");
    }

    @Bean
    public Binding bindingComprasReportes() {
        return BindingBuilder.bind(reportesEventosQueue()).to(eventsExchange()).with("compra.*");
    }

    @Bean
    public Binding bindingInventarioReportes() {
        return BindingBuilder.bind(reportesEventosQueue()).to(eventsExchange()).with("inventario.*");
    }

    @Bean
    public Binding bindingCatalogoReportes() {
        return BindingBuilder.bind(reportesEventosQueue()).to(eventsExchange()).with("catalogo.*");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
