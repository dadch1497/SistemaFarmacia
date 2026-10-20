package pe.farmagest.compras.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.compras.dto.CrearProveedorRequest;
import pe.farmagest.compras.dto.ProveedorDto;
import pe.farmagest.compras.service.ProveedorService;

import java.util.List;

@RestController
@RequestMapping("/api/compras/proveedores")
@Tag(name = "Proveedores", description = "Gestión de laboratorios y distribuidores mayoristas")
public class ProveedorController {

    private final ProveedorService proveedorService;

    public ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Listar proveedores activos")
    public ResponseEntity<List<ProveedorDto>> listarProveedores() {
        return ResponseEntity.ok(proveedorService.listarActivos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Obtener proveedor por ID")
    public ResponseEntity<ProveedorDto> obtenerProveedor(@PathVariable Integer id) {
        return ResponseEntity.ok(proveedorService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Registrar nuevo proveedor")
    public ResponseEntity<ProveedorDto> crearProveedor(@Valid @RequestBody CrearProveedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(proveedorService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Actualizar datos de proveedor")
    public ResponseEntity<ProveedorDto> actualizarProveedor(
            @PathVariable Integer id,
            @Valid @RequestBody CrearProveedorRequest request
    ) {
        return ResponseEntity.ok(proveedorService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Baja lógica de proveedor")
    public ResponseEntity<Void> darDeBajaProveedor(@PathVariable Integer id) {
        proveedorService.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }
}
