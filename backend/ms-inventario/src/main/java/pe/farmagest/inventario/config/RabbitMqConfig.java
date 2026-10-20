package pe.farmagest.inventario.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMqConfig {

    public static final String EXCHANGE_EVENTS = "farmagest.events";
    public static final String EXCHANGE_DLX = "farmagest.dlx";

    public static final String ROUTING_KEY_STOCK_BAJO = "inventario.stock-bajo";
    public static final String ROUTING_KEY_LOTE_VENCER = "inventario.lote-por-vencer";

    public static final String ROUTING_KEY_VENTA_REGISTRADA = "venta.registrada";
    public static final String ROUTING_KEY_VENTA_ANULADA = "venta.anulada";
    public static final String ROUTING_KEY_DEVOLUCION = "devolucion.registrada";
    public static final String ROUTING_KEY_COMPRA_INGRESO = "compra.ingreso-registrado";

    public static final String QUEUE_VENTA_REGISTRADA = "inventario.venta-registrada.queue";
    public static final String QUEUE_VENTA_ANULADA = "inventario.venta-anulada.queue";
    public static final String QUEUE_COMPRA_INGRESO = "inventario.compra-ingreso.queue";
    public static final String QUEUE_DLQ = "inventario.dlq";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(EXCHANGE_EVENTS, true, false);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(EXCHANGE_DLX, true, false);
    }

    @Bean
    public Queue dlqQueue() {
        return QueueBuilder.durable(QUEUE_DLQ).build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(dlqQueue()).to(deadLetterExchange()).with("inventario.dlq.rk");
    }

    private Map<String, Object> queueArguments() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", EXCHANGE_DLX);
        args.put("x-dead-letter-routing-key", "inventario.dlq.rk");
        return args;
    }

    @Bean
    public Queue ventaRegistradaQueue() {
        return new Queue(QUEUE_VENTA_REGISTRADA, true, false, false, queueArguments());
    }

    @Bean
    public Binding ventaRegistradaBinding() {
        return BindingBuilder.bind(ventaRegistradaQueue()).to(eventsExchange()).with(ROUTING_KEY_VENTA_REGISTRADA);
    }

    @Bean
    public Queue ventaAnuladaQueue() {
        return new Queue(QUEUE_VENTA_ANULADA, true, false, false, queueArguments());
    }

    @Bean
    public Binding ventaAnuladaBinding() {
        return BindingBuilder.bind(ventaAnuladaQueue()).to(eventsExchange()).with(ROUTING_KEY_VENTA_ANULADA);
    }

    @Bean
    public Binding devolucionBinding() {
        return BindingBuilder.bind(ventaAnuladaQueue()).to(eventsExchange()).with(ROUTING_KEY_DEVOLUCION);
    }

    @Bean
    public Queue compraIngresoQueue() {
        return new Queue(QUEUE_COMPRA_INGRESO, true, false, false, queueArguments());
    }

    @Bean
    public Binding compraIngresoBinding() {
        return BindingBuilder.bind(compraIngresoQueue()).to(eventsExchange()).with(ROUTING_KEY_COMPRA_INGRESO);
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
