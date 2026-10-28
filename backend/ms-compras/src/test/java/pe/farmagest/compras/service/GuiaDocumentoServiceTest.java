package pe.farmagest.compras.service;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import pe.farmagest.compras.repository.*;
import pe.farmagest.compras.entity.GuiaDocumento;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class GuiaDocumentoServiceTest {
 final GuiaDocumentoRepository repository=mock(GuiaDocumentoRepository.class);
 final IngresoMercaderiaRepository ingresos=mock(IngresoMercaderiaRepository.class);
 final GuiaDocumentoService service=new GuiaDocumentoService(repository,ingresos);
 @Test void preservesOriginalBytesAndSanitizesFilename(){
  byte[] bytes="%PDF-1.7 original".getBytes(StandardCharsets.US_ASCII);
  GuiaDocumento guia=service.validar(new MockMultipartFile("archivo","../../guia.pdf","text/html",bytes));
  assertEquals("application/pdf",guia.getTipo());assertEquals("guia.pdf",guia.getNombre());assertArrayEquals(bytes,guia.getContenido());
 }
 @Test void rejectsRenamedHtmlEmptyAndOversized(){
  assertThrows(ResponseStatusException.class,()->service.validar(new MockMultipartFile("archivo","a.pdf","application/pdf","<html>bad</html>".getBytes())));
  assertThrows(ResponseStatusException.class,()->service.validar(new MockMultipartFile("archivo",new byte[0])));
  assertThrows(ResponseStatusException.class,()->service.validar(new MockMultipartFile("archivo",new byte[12*1024*1024+1])));
 }
 @Test void missingDocumentIs404(){assertEquals(404,assertThrows(ResponseStatusException.class,()->service.obtener(99L)).getStatusCode().value());}
 @Test void refusesReplacementAndUnknownReceipts(){
  var file=new MockMultipartFile("archivo","g.pdf","application/pdf","%PDF-1.7 test".getBytes());
  assertEquals(404,assertThrows(ResponseStatusException.class,()->service.adjuntar(99L,file)).getStatusCode().value());
  when(ingresos.existsById(99L)).thenReturn(true);when(repository.existsById(99L)).thenReturn(true);
  assertEquals(409,assertThrows(ResponseStatusException.class,()->service.adjuntar(99L,file)).getStatusCode().value());
  verify(repository,never()).saveAndFlush(any());
 }
 @Test void attachmentKeepsReceiptLinkWithoutStockOperation(){
  when(ingresos.existsById(7L)).thenReturn(true);
  service.adjuntar(7L,new MockMultipartFile("archivo","g.pdf","application/pdf","%PDF-1.7 test".getBytes()));
  verify(repository).saveAndFlush(argThat(g->g.getIngresoId().equals(7L)&&g.getNombre().equals("g.pdf")));
 }
}
