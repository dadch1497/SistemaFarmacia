package pe.farmagest.ventas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.ventas.dto.AperturaCajaRequest;
import pe.farmagest.ventas.dto.CierreCajaRequest;
import pe.farmagest.ventas.dto.SesionCajaDto;
import pe.farmagest.ventas.entity.Caja;
import pe.farmagest.ventas.security.JwtAuthenticationFilter.UserPrincipal;
import pe.farmagest.ventas.service.CajaService;

import java.util.List;

@RestController
@RequestMapping("/api/caja")
@Tag(name = "Caja y Turnos", description = "Apertura, cierre de turno y arqueo de caja POS")
public class CajaController {

    private final CajaService cajaService;

    public CajaController(CajaService cajaService) {
        this.cajaService = cajaService;
    }

    @GetMapping("/cajas")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar cajas registradas en la sucursal")
    public ResponseEntity<List<Caja>> listarCajas(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(cajaService.listarCajas(sucursalId));
    }

    @GetMapping("/mi-turno")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Consultar sesión de caja activa del usuario")
    public ResponseEntity<SesionCajaDto> obtenerMiTurno(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        SesionCajaDto dto = cajaService.obtenerTurnoActivo(usuarioId, sucursalId);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.noContent().build();
    }

    @PostMapping("/apertura")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Abrir turno de caja")
    public ResponseEntity<SesionCajaDto> aperturaCaja(
            @Valid @RequestBody AperturaCajaRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(cajaService.aperturaCaja(request, usuarioId));
    }

    @PostMapping("/{id}/cierre")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Cerrar turno de caja y realizar arqueo")
    public ResponseEntity<SesionCajaDto> cierreCaja(
            @PathVariable Long id,
            @Valid @RequestBody CierreCajaRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        boolean esAdmin = esAdministrador(authentication);
        return ResponseEntity.ok(cajaService.cierreCaja(id, request, usuarioId, esAdmin));
    }

    @GetMapping("/sesiones")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar sesiones de caja (Admin ve todas, Vendedor ve las suyas)")
    public ResponseEntity<List<SesionCajaDto>> listarSesiones(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        boolean esAdmin = esAdministrador(authentication);
        return ResponseEntity.ok(cajaService.listarSesiones(sucursalId, usuarioId, esAdmin));
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return 1L;
    }

    private boolean esAdministrador(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getRoles() != null && principal.getRoles().contains("ROLE_ADMINISTRADOR");
        }
        return false;
    }
}
