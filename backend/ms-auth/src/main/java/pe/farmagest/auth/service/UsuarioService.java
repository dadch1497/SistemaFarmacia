package pe.farmagest.auth.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.auth.dto.ActualizarUsuarioRequest;
import pe.farmagest.auth.dto.CrearUsuarioRequest;
import pe.farmagest.auth.dto.UsuarioDto;
import pe.farmagest.auth.entity.Rol;
import pe.farmagest.auth.entity.Usuario;
import pe.farmagest.auth.repository.RolRepository;
import pe.farmagest.auth.repository.UsuarioRepository;

import java.util.HashSet;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioDto> listarUsuarios(String q, Pageable pageable) {
        return usuarioRepository.buscarUsuarios(q, pageable)
                .map(AuthService::mapearAUsuarioDto);
    }

    @Transactional(readOnly = true)
    public UsuarioDto obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con ID: " + id));
        return AuthService.mapearAUsuarioDto(usuario);
    }

    @Transactional
    public UsuarioDto crearUsuario(CrearUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("El username ya está en uso: " + request.getUsername());
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado: " + request.getEmail());
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());
        usuario.setSucursalId(request.getSucursalId() != null ? request.getSucursalId() : 1);
        usuario.setActivo(true);

        Set<Rol> roles = new HashSet<>(rolRepository.findAllById(request.getRolIds()));
        if (roles.isEmpty()) {
            throw new IllegalArgumentException("Debe asignar al menos un rol válido existente");
        }
        usuario.setRoles(roles);

        Usuario guardado = usuarioRepository.save(usuario);
        return AuthService.mapearAUsuarioDto(guardado);
    }

    @Transactional
    public UsuarioDto actualizarUsuario(Long id, ActualizarUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con ID: " + id));

        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());

        if (!usuario.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("El email ya está registrado por otro usuario: " + request.getEmail());
            }
            usuario.setEmail(request.getEmail());
        }

        if (request.getSucursalId() != null) {
            usuario.setSucursalId(request.getSucursalId());
        }
        if (request.getActivo() != null) {
            usuario.setActivo(request.getActivo());
        }

        if (request.getRolIds() != null && !request.getRolIds().isEmpty()) {
            Set<Rol> roles = new HashSet<>(rolRepository.findAllById(request.getRolIds()));
            usuario.setRoles(roles);
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        return AuthService.mapearAUsuarioDto(actualizado);
    }

    @Transactional
    public void darDeBaja(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con ID: " + id));
        usuario.setActivo(false); // Baja lógica
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void cambiarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado con ID: " + id));
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
    }
}
