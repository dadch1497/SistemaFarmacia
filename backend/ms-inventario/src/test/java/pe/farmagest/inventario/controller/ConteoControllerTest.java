package pe.farmagest.inventario.controller;
import org.junit.jupiter.api.Test;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;import org.springframework.boot.test.mock.mockito.MockBean;import org.springframework.context.annotation.Import;import org.springframework.test.web.servlet.MockMvc;import org.springframework.http.MediaType;
import pe.farmagest.inventario.service.ConteoService;import pe.farmagest.inventario.security.*;import java.util.List;
import static org.mockito.Mockito.*;import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;import org.springframework.security.core.authority.SimpleGrantedAuthority;import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
@WebMvcTest(ConteoController.class) @Import({SecurityConfig.class,JwtAuthenticationFilter.class})
class ConteoControllerTest {
 @Autowired MockMvc mvc;@MockBean ConteoService service;@MockBean JwtService jwt;
 UsernamePasswordAuthenticationToken token(String role){var p=new JwtAuthenticationFilter.UserPrincipal(8L,"test",1L,List.of(role));return new UsernamePasswordAuthenticationToken(p,null,List.of(new SimpleGrantedAuthority(role)));}
 @Test void anonymousDenied()throws Exception{mvc.perform(get("/api/inventario/conteos")).andExpect(status().isForbidden());verifyNoInteractions(service);}
 @Test void vendorDenied()throws Exception{mvc.perform(get("/api/inventario/conteos").with(authentication(token("ROLE_VENDEDOR")))).andExpect(status().isForbidden());verifyNoInteractions(service);}
 @Test void warehouseAllowed()throws Exception{mvc.perform(get("/api/inventario/conteos").with(authentication(token("ROLE_ALMACENERO")))).andExpect(status().isOk());verify(service).listar(eq(1),eq(0),any());}
 @Test void warehouseCannotRecordReview()throws Exception{mvc.perform(post("/api/inventario/conteos/1/revision").with(authentication(token("ROLE_ALMACENERO"))).contentType(MediaType.APPLICATION_JSON).content("{\"nota\":\"Revisado\"}")).andExpect(status().isForbidden());verifyNoInteractions(service);}
 @Test void fractionalCountRejectedWithoutTruncating()throws Exception{mvc.perform(put("/api/inventario/conteos/1/lineas").with(authentication(token("ROLE_ALMACENERO"))).header("Authorization","Bearer test").contentType(MediaType.APPLICATION_JSON).content("{\"productoId\":5,\"cantidad\":1.5}")).andExpect(status().isBadRequest());verifyNoInteractions(service);}
 @Test void wholeCountReachesService()throws Exception{mvc.perform(put("/api/inventario/conteos/1/lineas").with(authentication(token("ROLE_ALMACENERO"))).header("Authorization","Bearer test").contentType(MediaType.APPLICATION_JSON).content("{\"productoId\":5,\"cantidad\":0,\"observacion\":\"Sin unidades\"}")).andExpect(status().isOk());verify(service).contar(eq(1L),eq(5L),eq(0),eq("Sin unidades"),any(),eq("Bearer test"));}
}
