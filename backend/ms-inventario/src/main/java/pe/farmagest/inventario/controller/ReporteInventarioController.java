package pe.farmagest.inventario.controller;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.farmagest.inventario.service.ReporteInventarioService;
import pe.farmagest.inventario.dto.ReporteInventarioResponse;
import pe.farmagest.inventario.security.JwtAuthenticationFilter.UserPrincipal;
@RestController @RequestMapping("/api/inventario/reportes")
public class ReporteInventarioController {
 private final ReporteInventarioService service;
 public ReporteInventarioController(ReporteInventarioService service){this.service=service;}
 @GetMapping @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR','ROLE_ALMACENERO')")
 public ReporteInventarioResponse reporte(@RequestParam(defaultValue="1") Integer sucursalId,
  @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate desde,
  @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate hasta,
  @RequestParam(required=false) Long productoId,Authentication authentication){
  if(authentication.getPrincipal() instanceof UserPrincipal user && !user.getRoles().contains("ROLE_ADMINISTRADOR") && !Long.valueOf(sucursalId.longValue()).equals(user.getSucursalId()))
   throw new ResponseStatusException(HttpStatus.FORBIDDEN,"No puedes consultar otra sucursal");
  return service.consultar(sucursalId,desde,hasta,productoId);
 }
 @ExceptionHandler(ResponseStatusException.class)
 public org.springframework.http.ProblemDetail errorReporte(ResponseStatusException error){
  return org.springframework.http.ProblemDetail.forStatusAndDetail(error.getStatusCode(),error.getReason());
 }
 @ExceptionHandler({org.springframework.web.bind.MissingServletRequestParameterException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class})
 public org.springframework.http.ProblemDetail parametrosInvalidos(Exception error){
  return org.springframework.http.ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,"Selecciona las fechas Desde y Hasta en formato AAAA-MM-DD.");
 }
}
