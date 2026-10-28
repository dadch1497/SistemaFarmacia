package pe.farmagest.inventario.controller;
import org.springframework.web.bind.annotation.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.core.Authentication;import org.springframework.http.*;import org.springframework.web.server.ResponseStatusException;import org.springframework.web.multipart.MultipartFile;import pe.farmagest.inventario.security.JwtAuthenticationFilter.UserPrincipal;import pe.farmagest.inventario.service.ConteoService;import pe.farmagest.inventario.dto.ConteoDto;import java.util.List;
@RestController @RequestMapping("/api/inventario/conteos") @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR','ROLE_ALMACENERO')")
public class ConteoController {
 private final ConteoService service;public ConteoController(ConteoService s){service=s;}
 private UserPrincipal user(Authentication a){if(a==null||!(a.getPrincipal() instanceof UserPrincipal u))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Vuelve a iniciar sesión");return u;}
 public record Crear(Integer sucursalId,String referencia){}
 public record Contar(Long productoId,java.math.BigDecimal cantidad,String observacion){}
 public record Revision(String nota){}
 @GetMapping public List<ConteoDto> listar(@RequestParam(defaultValue="1") Integer sucursalId,@RequestParam(defaultValue="0") int pagina,Authentication a){return service.listar(sucursalId,pagina,user(a));}
 @PostMapping public ConteoDto crear(@RequestBody Crear r,Authentication a){return service.crear(r.sucursalId(),r.referencia(),user(a));}
 @GetMapping("/{id}") public ConteoDto ver(@PathVariable Long id,Authentication a){return service.ver(id,user(a));}
 @PutMapping("/{id}/lineas") public ConteoDto contar(@PathVariable Long id,@RequestBody Contar r,Authentication a,@RequestHeader("Authorization") String auth){return service.contar(id,r.productoId(),r.cantidad()==null?null:r.cantidad().intValueExact(),r.observacion(),user(a),auth);}
 @PostMapping("/{id}/finalizar") public ConteoDto cerrar(@PathVariable Long id,Authentication a){return service.cerrar(id,user(a));}
 @PostMapping("/{id}/cancelar") public ConteoDto cancelar(@PathVariable Long id,Authentication a){return service.cancelar(id,user(a));}
 @PostMapping("/{id}/revision") @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')") public ConteoDto revisar(@PathVariable Long id,@RequestBody Revision r,Authentication a){return service.revisar(id,r.nota(),user(a));}
 @PostMapping(value="/{id}/foto",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public ConteoDto foto(@PathVariable Long id,@RequestParam("foto") MultipartFile foto,Authentication a)throws java.io.IOException{if(foto.getSize()>8*1024*1024)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Foto de hasta 8 MB");return service.foto(id,foto.getBytes(),foto.getContentType(),user(a));}
 @GetMapping("/{id}/foto") public ResponseEntity<byte[]> foto(@PathVariable Long id,Authentication a){var f=service.obtenerFoto(id,user(a));return ResponseEntity.ok().contentType(MediaType.parseMediaType(f.tipo)).header("X-Content-Type-Options","nosniff").header("Cache-Control","no-store").header("Content-Disposition","inline; filename=conteo-"+id+".foto").body(f.contenido);}
 @ExceptionHandler(ResponseStatusException.class) public ProblemDetail error(ResponseStatusException e){return ProblemDetail.forStatusAndDetail(e.getStatusCode(),e.getReason());}
 @ExceptionHandler({ArithmeticException.class,org.springframework.http.converter.HttpMessageNotReadableException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,org.springframework.web.multipart.MaxUploadSizeExceededException.class}) public ProblemDetail invalido(Exception e){return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,"Revisa los campos y el límite de 8 MB de la foto.");}
}
