package pe.farmagest.ventas.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;

/** Consulta externa solo a solicitud del usuario; nunca registra cuerpos ni credenciales. */
@Service
public class CodartDniClient {
    private final RestClient client;
    private final String token;

    @org.springframework.beans.factory.annotation.Autowired
    public CodartDniClient(RestClient.Builder builder, @Value("${codart.token:}") String token) {
        this.token = token.trim();
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.client = builder.requestFactory(factory).baseUrl("https://api-codart.cgrt.org").build();
    }

    CodartDniClient(RestClient client, String token) {
        this.client = client; this.token = token.trim();
    }

    public String consultarNombre(String dni) { return consultar(dni, false); }
    public String consultarRazonSocial(String ruc) { return consultar(ruc, true); }

    private String consultar(String dni, boolean ruc) {
        if (token.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "La consulta externa aún no tiene token configurado. Puedes registrar el cliente manualmente.");
        try {
            JsonNode body = client.get().uri(ruc ? "/api/v1/consultas/sunat/ruc/{documento}" : "/api/v1/consultas/reniec/dni/{documento}", dni)
                    .header("Authorization", "Bearer " + token).header("Content-Type", "application/json")
                    .retrieve().body(JsonNode.class);
            if (body == null || !body.path("success").asBoolean(false))
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "CodArt no confirmó el documento. Revisa el número o registra el cliente manualmente.");
            JsonNode result = body.path("result");
            if (ruc) {
                if (!dni.equals(result.path("numero_documento").asText()) || !"6".equals(result.path("tipo_documento").asText()))
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "La respuesta de CodArt no corresponde al RUC solicitado.");
                String razon = campo(result, "razon_social").replaceAll("\\s+", " ").trim();
                if (razon.isBlank() || razon.length() > 150)
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "CodArt devolvió una razón social incompleta o inválida.");
                return razon;
            }
            if (!dni.equals(result.path("document_number").asText()) || !"1".equals(result.path("document_type").asText()))
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "La respuesta de CodArt no corresponde al DNI solicitado.");
            String nombres = campo(result, "first_name");
            String paterno = campo(result, "first_last_name");
            String materno = campo(result, "second_last_name");
            String nombre = String.join(" ", nombres, paterno, materno).replaceAll("\\s+", " ").trim();
            if (nombres.isBlank() || paterno.isBlank() || nombre.length() > 150)
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "CodArt devolvió nombres incompletos o inválidos.");
            return nombre;
        } catch (RestClientResponseException error) {
            int status = error.getStatusCode().value();
            if (status == 404) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento no encontrado en el proveedor. Puedes registrarlo manualmente.");
            if (status == 429 || status == 402) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "CodArt no permite más consultas por ahora. Revisa tu cuota o registra el cliente manualmente.");
            if (status == 401 || status == 403) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "El proveedor rechazó la credencial de consulta. Revisa el token de CodArt.");
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo consultar CodArt. Intenta más tarde o registra el cliente manualmente.");
        } catch (RestClientException error) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "CodArt no respondió correctamente. Intenta más tarde o registra el cliente manualmente.");
        }
    }

    private String campo(JsonNode result, String field) {
        JsonNode value = result.path(field);
        String text = value.isTextual() ? value.asText().trim() : "";
        return text.equalsIgnoreCase("Data in credit") ? "" : text;
    }
}
