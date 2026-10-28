package pe.farmagest.inventario.service;
import org.springframework.stereotype.Service;import org.springframework.web.client.*;import org.springframework.beans.factory.annotation.Value;import com.fasterxml.jackson.databind.JsonNode;import org.springframework.http.HttpStatus;import org.springframework.web.server.ResponseStatusException;
@Service public class ConteoCatalogoClient {
 private final RestClient client;
 public ConteoCatalogoClient(RestClient.Builder builder,@Value("${conteo.catalogo-url:http://ms-catalogo:8082}") String url){var f=new org.springframework.http.client.SimpleClientHttpRequestFactory();f.setConnectTimeout(3000);f.setReadTimeout(5000);client=builder.baseUrl(url).requestFactory(f).build();}
 public record Producto(Long id,String nombre,String codigo,String presentacion){}
 public Producto obtener(Long id,String autorizacion){
  try {JsonNode p=client.get().uri("/api/catalogo/productos/{id}",id).header("Authorization",autorizacion).retrieve().body(JsonNode.class);
   if(p==null || p.path("id").asLong()!=id || p.path("nombre").asText().isBlank())throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Catálogo devolvió un producto inválido");
   return new Producto(id,p.path("nombre").asText(),p.path("codigoBarras").asText(),p.path("presentacion").asText());
  }catch(RestClientResponseException e){if(e.getStatusCode().value()==404)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado en catálogo");throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo verificar el producto en catálogo");}
  catch(RestClientException e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Catálogo no disponible. No se guardó el conteo.");}
 }
}
