package pe.farmagest.compras;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MsComprasApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsComprasApplication.class, args);
    }
}
