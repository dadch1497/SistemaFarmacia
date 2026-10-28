package pe.farmagest.compras.controller;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pe.farmagest.compras.service.*;
import pe.farmagest.compras.security.*;
import pe.farmagest.compras.entity.GuiaDocumento;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(ComprasController.class)
@Import({SecurityConfig.class,JwtAuthenticationFilter.class})
class GuiaDocumentoControllerTest {
 @Autowired MockMvc mvc;
 @MockBean ComprasService compras;
 @MockBean GuiaDocumentoService guias;
 @MockBean JwtService jwt;
 @Test void anonymousCannotDownload() throws Exception {mvc.perform(get("/api/compras/ingresos/7/guia")).andExpect(status().isForbidden());verifyNoInteractions(guias);}
 @Test @WithMockUser(roles="VENDEDOR") void sellerCannotDownload() throws Exception {mvc.perform(get("/api/compras/ingresos/7/guia")).andExpect(status().isForbidden());verifyNoInteractions(guias);}
 @Test @WithMockUser(roles="ALMACENERO") void warehouseCanDownloadOriginal() throws Exception {
  GuiaDocumento guia=new GuiaDocumento();guia.setTipo("application/pdf");guia.setNombre("guia.pdf");guia.setContenido("%PDF-1.7 test".getBytes());when(guias.obtener(7L)).thenReturn(guia);
  mvc.perform(get("/api/compras/ingresos/7/guia")).andExpect(status().isOk()).andExpect(content().bytes(guia.getContenido())).andExpect(header().string("X-Content-Type-Options","nosniff")).andExpect(header().string("Cache-Control","no-store")).andExpect(header().string("Content-Type","application/pdf"));
 }
}
