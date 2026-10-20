package pe.farmagest.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.auth.dto.LoginRequest;
import pe.farmagest.auth.dto.LoginResponse;
import pe.farmagest.auth.dto.UsuarioDto;
import pe.farmagest.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints de login, sesión y perfil de usuario")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener token JWT con roles y permisos")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Consultar el perfil y permisos del usuario actualmente autenticado")
    public ResponseEntity<UsuarioDto> perfil(Authentication authentication) {
        String username = authentication.getName();
        UsuarioDto perfil = authService.obtenerPerfil(username);
        return ResponseEntity.ok(perfil);
    }
}
