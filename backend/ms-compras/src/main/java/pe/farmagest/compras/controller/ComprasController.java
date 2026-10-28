package pe.farmagest.compras.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.compras.dto.*;
import pe.farmagest.compras.entity.EstadoOrden;
import pe.farmagest.compras.security.JwtAuthenticationFilter.UserPrincipal;
import pe.farmagest.compras.service.ComprasService;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@Tag(name = "Compras y Abastecimiento", description = "Órdenes de compra y recepción física de mercadería con lotes")
public class ComprasController {

    private final ComprasService comprasService;
    private final pe.farmagest.compras.service.GuiaDocumentoService guias;

    public ComprasController(ComprasService comprasService, pe.farmagest.compras.service.GuiaDocumentoService guias) {
        this.comprasService = comprasService;
        this.guias = guias;
    }

    @GetMapping("/ordenes")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Listar órdenes de compra")
    public ResponseEntity<List<OrdenCompraDto>> listarOrdenes(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(comprasService.listarOrdenes(sucursalId));
    }

    @GetMapping("/ordenes/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Obtener detalle de orden de compra")
    public ResponseEntity<OrdenCompraDto> obtenerOrden(@PathVariable Long id) {
        return ResponseEntity.ok(comprasService.obtenerOrdenPorId(id));
    }

    @PostMapping("/ordenes")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Crear orden de compra (solo Administrador)")
    public ResponseEntity<OrdenCompraDto> crearOrden(
            @Valid @RequestBody CrearOrdenCompraRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(comprasService.crearOrden(request, usuarioId));
    }

    @PatchMapping("/ordenes/{id}/estado")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Aprobar o cambiar estado de orden de compra")
    public ResponseEntity<OrdenCompraDto> cambiarEstadoOrden(
            @PathVariable Long id,
            @RequestParam(name = "nuevoEstado") EstadoOrden nuevoEstado
    ) {
        return ResponseEntity.ok(comprasService.cambiarEstadoOrden(id, nuevoEstado));
    }

    @GetMapping("/ingresos")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Listar ingresos físicos de mercadería en almacén")
    public ResponseEntity<List<IngresoMercaderiaDto>> listarIngresos(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(comprasService.listarIngresos(sucursalId));
    }

    @GetMapping("/ingresos/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Obtener detalle de ingreso de mercadería")
    public ResponseEntity<IngresoMercaderiaDto> obtenerIngreso(@PathVariable Long id) {
        return ResponseEntity.ok(comprasService.obtenerIngresoPorId(id));
    }

    @PostMapping("/ingresos")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Registrar ingreso físico de mercadería (guía, factura, lotes y vencimientos)")
    public ResponseEntity<IngresoMercaderiaDto> registrarIngreso(
            @Valid @RequestBody RegistrarIngresoRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(comprasService.registrarIngreso(request, usuarioId));
    }

    @PostMapping(value="/ingresos/con-guia", consumes="multipart/form-data")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    public ResponseEntity<IngresoMercaderiaDto> registrarConGuia(
      @Valid @RequestPart("registro") RegistrarIngresoRequest request,
      @RequestPart("archivo") org.springframework.web.multipart.MultipartFile archivo, Authentication authentication) {
      return ResponseEntity.status(HttpStatus.CREATED).body(comprasService.registrarIngresoConGuia(request,obtenerUsuarioId(authentication),archivo));
    }

    @PostMapping(value="/ingresos/{id}/guia", consumes="multipart/form-data")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    public ResponseEntity<Void> adjuntarGuia(@PathVariable Long id,@RequestPart("archivo") org.springframework.web.multipart.MultipartFile archivo){
      guias.adjuntar(id,archivo);return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/ingresos/{id}/guia")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    public ResponseEntity<byte[]> descargarGuia(@PathVariable Long id){
      var guia=guias.obtener(id);
      return ResponseEntity.ok().contentType(org.springframework.http.MediaType.parseMediaType(guia.getTipo()))
        .header("Content-Disposition",org.springframework.http.ContentDisposition.attachment().filename(guia.getNombre(),java.nio.charset.StandardCharsets.UTF_8).build().toString())
        .header("Access-Control-Expose-Headers","Content-Disposition").header("X-Content-Type-Options","nosniff").header("Cache-Control","no-store")
        .contentLength(guia.getContenido().length).body(guia.getContenido());
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return 1L;
    }
}
