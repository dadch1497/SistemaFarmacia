package pe.farmagest.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.auth.dto.ActualizarUsuarioRequest;
import pe.farmagest.auth.dto.CrearUsuarioRequest;
import pe.farmagest.auth.dto.UsuarioDto;
import pe.farmagest.auth.service.UsuarioService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/usuarios")
@Tag(name = "Usuarios", description = "Gestión administrativa de cuentas de usuario y roles")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @Operation(summary = "Listar usuarios con paginación y búsqueda por término")
    public ResponseEntity<Page<UsuarioDto>> listar(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10, sort = "id") Pageable pageable
    ) {
        Page<UsuarioDto> pagina = usuarioService.listarUsuarios(q, pageable);
        return ResponseEntity.ok(pagina);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar el detalle de un usuario por su ID")
    public ResponseEntity<UsuarioDto> obtenerPorId(@PathVariable Long id) {
        UsuarioDto dto = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo usuario con roles asignados")
    public ResponseEntity<UsuarioDto> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioDto creado = usuarioService.crearUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar información de un usuario existente")
    public ResponseEntity<UsuarioDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest request
    ) {
        UsuarioDto actualizado = usuarioService.actualizarUsuario(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Habilitar o deshabilitar un usuario")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body
    ) {
        boolean activo = body.getOrDefault("activo", true);
        usuarioService.cambiarEstado(id, activo);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Baja lógica de usuario (desactivación)")
    public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
        usuarioService.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }
}
