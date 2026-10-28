package pe.farmagest.inventario.controller;
import org.junit.jupiter.api.Test;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;import org.springframework.boot.test.mock.mockito.MockBean;import org.springframework.context.annotation.Import;import org.springframework.security.test.context.support.WithMockUser;import org.springframework.test.web.servlet.MockMvc;import pe.farmagest.inventario.service.ReporteInventarioService;import pe.farmagest.inventario.security.*;
import static org.mockito.Mockito.*;import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(ReporteInventarioController.class) @Import({SecurityConfig.class,JwtAuthenticationFilter.class})
class ReporteInventarioControllerTest {
 @Autowired MockMvc mvc;@MockBean ReporteInventarioService service;@MockBean JwtService jwt;
 final String url="/api/inventario/reportes?desde=2026-10-01&hasta=2026-10-27";
 @Test void anonymousDenied()throws Exception{mvc.perform(get(url)).andExpect(status().isForbidden());verifyNoInteractions(service);}
 @Test @WithMockUser(roles="VENDEDOR") void sellerDeniedEvenByDirectUrl()throws Exception{mvc.perform(get(url)).andExpect(status().isForbidden());verifyNoInteractions(service);}
 @Test @WithMockUser(roles="ALMACENERO") void warehouseAllowed()throws Exception{mvc.perform(get(url)).andExpect(status().isOk());verify(service).consultar(eq(1),any(),any(),isNull());}
 @Test @WithMockUser(roles="ADMINISTRADOR") void adminAllowed()throws Exception{mvc.perform(get(url)).andExpect(status().isOk());}
 @Test @WithMockUser(roles="ALMACENERO") void datesRequired()throws Exception{mvc.perform(get("/api/inventario/reportes")).andExpect(status().isBadRequest());verifyNoInteractions(service);}
 @Test @WithMockUser(roles="ALMACENERO") void preservesReportTooLargeStatus()throws Exception{when(service.consultar(anyInt(),any(),any(),any())).thenThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY,"Reduce el período"));mvc.perform(get(url)).andExpect(status().isUnprocessableEntity());}
 @Test void warehouseCannotRequestAnotherBranch()throws Exception{
  var principal=new pe.farmagest.inventario.security.JwtAuthenticationFilter.UserPrincipal(8L,"almacen",1L,java.util.List.of("ROLE_ALMACENERO"));
  var token=new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(principal,null,java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ALMACENERO")));
  mvc.perform(get(url+"&sucursalId=2").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(token))).andExpect(status().isForbidden());verifyNoInteractions(service);
 }
 @Test void warehouseCanRequestOwnBranch()throws Exception{
  var principal=new pe.farmagest.inventario.security.JwtAuthenticationFilter.UserPrincipal(8L,"almacen",1L,java.util.List.of("ROLE_ALMACENERO"));
  var token=new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(principal,null,java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ALMACENERO")));
  mvc.perform(get(url+"&sucursalId=1").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(token))).andExpect(status().isOk());verify(service).consultar(eq(1),any(),any(),isNull());
 }}
