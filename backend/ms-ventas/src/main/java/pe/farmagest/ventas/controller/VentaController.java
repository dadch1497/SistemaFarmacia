package pe.farmagest.ventas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.ventas.dto.*;
import pe.farmagest.ventas.security.JwtAuthenticationFilter.UserPrincipal;
import pe.farmagest.ventas.service.VentaService;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@Tag(name = "Ventas y POS", description = "Emisión de comprobantes, cobro, anulación y ventas en espera")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar ventas (Admin ve todas, Vendedor ve las suyas)")
    public ResponseEntity<List<VentaDto>> listarVentas(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        boolean esAdmin = esAdministrador(authentication);
        return ResponseEntity.ok(ventaService.listarVentas(sucursalId, usuarioId, esAdmin));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Obtener detalle de venta por ID")
    public ResponseEntity<VentaDto> obtenerVenta(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerVentaPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Registrar venta POS (Boleta o Factura con medios de pago)")
    public ResponseEntity<VentaDto> registrarVenta(
            @Valid @RequestBody RegistrarVentaRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        String nombreVendedor = obtenerUsername(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.registrarVenta(request, usuarioId, nombreVendedor));
    }

    @PostMapping("/{id}/anular")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Anular venta (Solo Administrador)")
    public ResponseEntity<VentaDto> anularVenta(
            @PathVariable Long id,
            @Valid @RequestBody AnularVentaRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.ok(ventaService.anularVenta(id, request, usuarioId));
    }

    // ==========================================
    // Ventas en espera
    // ==========================================
    @GetMapping("/espera")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar ventas en espera del vendedor")
    public ResponseEntity<List<VentaEsperaDto>> listarVentasEnEspera(Authentication authentication) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.ok(ventaService.listarVentasEnEspera(usuarioId));
    }

    @PostMapping("/espera")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Guardar venta en espera temporalmente")
    public ResponseEntity<VentaEsperaDto> guardarVentaEnEspera(
            @Valid @RequestBody GuardarVentaEsperaRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.guardarVentaEnEspera(request, usuarioId));
    }

    @DeleteMapping("/espera/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Eliminar o reanudar venta en espera")
    public ResponseEntity<Void> eliminarVentaEnEspera(@PathVariable Long id) {
        ventaService.eliminarVentaEnEspera(id);
        return ResponseEntity.noContent().build();
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return 1L;
    }

    private String obtenerUsername(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUsername();
        }
        return "usuario";
    }

    private boolean esAdministrador(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getRoles() != null && principal.getRoles().contains("ROLE_ADMINISTRADOR");
        }
        return false;
    }
}
