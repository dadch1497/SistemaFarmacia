package pe.farmagest.ventas.service;
import org.junit.jupiter.api.*;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
class CodartDniClientTest {
 RestClient.Builder builder; MockRestServiceServer server; CodartDniClient client;
 @BeforeEach void setup(){builder=RestClient.builder();server=MockRestServiceServer.bindTo(builder).build();client=new CodartDniClient(builder.baseUrl("https://api-codart.cgrt.org").build(),"test-only-token");}
 String json(String doc){return "{\"success\":true,\"result\":{\"document_number\":\""+doc+"\",\"document_type\":\"1\",\"first_name\":\"ANA\",\"first_last_name\":\"PEREZ\",\"second_last_name\":\"LOPEZ\",\"address\":\"Data in credit\"}}";}
 void expect(){server.expect(requestTo("https://api-codart.cgrt.org/api/v1/consultas/reniec/dni/12345678")).andExpect(header("Authorization","Bearer test-only-token"));}
 @Test void mapsOnlyNames(){server.expect(anything()).andExpect(header("Authorization","Bearer test-only-token")).andRespond(withSuccess(json("12345678"),MediaType.APPLICATION_JSON));assertEquals("ANA PEREZ LOPEZ",client.consultarNombre("12345678"));server.verify();}
 @Test void rejectsMismatchedDocument(){server.expect(anything()).andRespond(withSuccess(json("87654321"),MediaType.APPLICATION_JSON));assertEquals(502,assertThrows(ResponseStatusException.class,()->client.consultarNombre("12345678")).getStatusCode().value());}
 @Test void missingTokenDoesNotCallProvider(){var noToken=new CodartDniClient(builder.build(),"");assertEquals(503,assertThrows(ResponseStatusException.class,()->noToken.consultarNombre("12345678")).getStatusCode().value());server.verify();}
 @Test void exhaustedQuotaHasClearStatus(){server.expect(anything()).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));assertEquals(429,assertThrows(ResponseStatusException.class,()->client.consultarNombre("12345678")).getStatusCode().value());}
 @Test void expiredTokenHasClearStatus(){server.expect(anything()).andRespond(withStatus(HttpStatus.UNAUTHORIZED));assertEquals(503,assertThrows(ResponseStatusException.class,()->client.consultarNombre("12345678")).getStatusCode().value());}
 @Test void rejectsRestrictedNames(){server.expect(anything()).andRespond(withSuccess(json("12345678").replace("ANA","Data in credit"),MediaType.APPLICATION_JSON));assertThrows(ResponseStatusException.class,()->client.consultarNombre("12345678"));}

 @Test void rucMapsExactDocumentAndRazonSocial(){server.expect(requestTo("https://api-codart.cgrt.org/api/v1/consultas/sunat/ruc/20538856674")).andExpect(header("Authorization","Bearer test-only-token")).andRespond(withSuccess("{\"success\":true,\"result\":{\"numero_documento\":\"20538856674\",\"tipo_documento\":\"6\",\"razon_social\":\"EMPRESA PRUEBA S.A.C.\"}}",MediaType.APPLICATION_JSON));assertEquals("EMPRESA PRUEBA S.A.C.",client.consultarRazonSocial("20538856674"));server.verify();}
 @Test void mismatchedRucNotAccepted(){server.expect(anything()).andRespond(withSuccess("{\"success\":true,\"result\":{\"numero_documento\":\"20111111111\",\"tipo_documento\":\"6\",\"razon_social\":\"OTRA EMPRESA\"}}",MediaType.APPLICATION_JSON));assertThrows(ResponseStatusException.class,()->client.consultarRazonSocial("20538856674"));}
}
