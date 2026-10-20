package pe.farmagest.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.auth.dto.LoginRequest;
import pe.farmagest.auth.dto.LoginResponse;
import pe.farmagest.auth.dto.UsuarioDto;
import pe.farmagest.auth.entity.Permiso;
import pe.farmagest.auth.entity.Rol;
import pe.farmagest.auth.entity.Usuario;
import pe.farmagest.auth.repository.UsuarioRepository;
import pe.farmagest.auth.security.CustomUserDetails;
import pe.farmagest.auth.security.JwtService;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Credenciales incorrectas para el usuario: " + request.getUsername());
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Usuario usuario = userDetails.getUsuario();

        if (!usuario.getActivo()) {
            throw new IllegalStateException("La cuenta de usuario se encuentra inactiva o dada de baja");
        }

        List<String> roles = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toList());

        List<String> permisos = usuario.getRoles().stream()
                .flatMap(r -> r.getPermisos().stream())
                .map(Permiso::getCodigo)
                .distinct()
                .collect(Collectors.toList());

        String rolPrincipal = roles.isEmpty() ? "ROLE_VENDEDOR" : roles.get(0);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", usuario.getId());
        extraClaims.put("username", usuario.getUsername());
        extraClaims.put("sucursalId", usuario.getSucursalId());
        extraClaims.put("roles", roles);
        extraClaims.put("permisos", permisos);

        String token = jwtService.generateToken(userDetails, extraClaims);

        LoginResponse.UsuarioInfo info = new LoginResponse.UsuarioInfo();
        info.setId(usuario.getId());
        info.setUsername(usuario.getUsername());
        info.setNombres(usuario.getNombres());
        info.setApellidos(usuario.getApellidos());
        info.setEmail(usuario.getEmail());
        info.setRolPrincipal(rolPrincipal);
        info.setSucursalId(usuario.getSucursalId());
        info.setRoles(roles);
        info.setPermisos(permisos);

        return new LoginResponse(token, jwtService.getExpirationTime(), info);
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtenerPerfil(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        return mapearAUsuarioDto(usuario);
    }

    public static UsuarioDto mapearAUsuarioDto(Usuario usuario) {
        UsuarioDto dto = new UsuarioDto();
        dto.setId(usuario.getId());
        dto.setUsername(usuario.getUsername());
        dto.setNombres(usuario.getNombres());
        dto.setApellidos(usuario.getApellidos());
        dto.setEmail(usuario.getEmail());
        dto.setSucursalId(usuario.getSucursalId());
        dto.setActivo(usuario.getActivo());
        dto.setCreadoEn(usuario.getCreadoEn());

        dto.setRoles(usuario.getRoles().stream().map(Rol::getNombre).collect(Collectors.toList()));
        dto.setPermisos(usuario.getRoles().stream()
                .flatMap(r -> r.getPermisos().stream())
                .map(Permiso::getCodigo)
                .distinct()
                .collect(Collectors.toList()));

        return dto;
    }
}
