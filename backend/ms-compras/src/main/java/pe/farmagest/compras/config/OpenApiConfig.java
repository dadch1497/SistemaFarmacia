package pe.farmagest.compras.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI comprasOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FarmaGest — API de Compras y Abastecimiento")
                        .description("Microservicio encargado de proveedores farmacéuticos, emisión de órdenes de compra y recepción física de mercadería con control de lotes.")
                        .version("1.0.0")
                        .contact(new Contact().name("FarmaGest Tech Team").email("soporte@farmagest.pe")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .name("BearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
