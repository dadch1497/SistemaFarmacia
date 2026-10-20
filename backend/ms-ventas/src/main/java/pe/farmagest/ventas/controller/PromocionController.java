package pe.farmagest.ventas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.ventas.dto.CrearPromocionRequest;
import pe.farmagest.ventas.dto.PromocionDto;
import pe.farmagest.ventas.dto.ValidarCuponRequest;
import pe.farmagest.ventas.dto.ValidarCuponResponse;
import pe.farmagest.ventas.service.PromocionService;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@Tag(name = "Promociones y Cupones", description = "Reglas de descuento y validación de cupones para el POS")
public class PromocionController {

    private final PromocionService promocionService;

    public PromocionController(PromocionService promocionService) {
        this.promocionService = promocionService;
    }

    @GetMapping("/promociones")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar promociones vigentes")
    public ResponseEntity<List<PromocionDto>> listarPromociones() {
        return ResponseEntity.ok(promocionService.listarTodasPromociones());
    }

    @PostMapping("/promociones")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Crear nueva promoción comercial (Solo Administrador)")
    public ResponseEntity<PromocionDto> crearPromocion(@Valid @RequestBody CrearPromocionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promocionService.crearPromocion(request));
    }

    @PatchMapping("/promociones/{id}/estado")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Habilitar o pausar una promoción")
    public ResponseEntity<Void> cambiarEstadoPromocion(@PathVariable Long id, @RequestParam boolean activo) {
        promocionService.cambiarEstadoPromocion(id, activo);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cupones/validar")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Validar cupón y calcular descuento aplicable")
    public ResponseEntity<ValidarCuponResponse> validarCupon(@Valid @RequestBody ValidarCuponRequest request) {
        return ResponseEntity.ok(promocionService.validarCupon(request));
    }
}
