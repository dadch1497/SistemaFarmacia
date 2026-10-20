package pe.farmagest.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.auth.entity.Rol;
import pe.farmagest.auth.entity.Usuario;
import pe.farmagest.auth.repository.RolRepository;
import pe.farmagest.auth.repository.UsuarioRepository;

import java.util.Collections;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${farmagest.initial-passwords.admin:AdminSecure2026!}")
    private String adminPassword;

    @Value("${farmagest.initial-passwords.vendedor1:Vendedor1Secure2026!}")
    private String vendedor1Password;

    @Value("${farmagest.initial-passwords.vendedor2:Vendedor2Secure2026!}")
    private String vendedor2Password;

    @Value("${farmagest.initial-passwords.almacenero:AlmaceneroSecure2026!}")
    private String almaceneroPassword;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           RolRepository rolRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Iniciando verificación y sincronización de contraseñas de usuarios semilla desde variables de entorno...");

        sincronizarUsuario("admin", adminPassword, "Administrador", "Farma Ochenta", "admin@farmaochenta.pe", "ROLE_ADMINISTRADOR");
        sincronizarUsuario("vendedor1", vendedor1Password, "Carlos", "Gómez Soto", "carlos.gomez@farmaochenta.pe", "ROLE_VENDEDOR");
        sincronizarUsuario("vendedor2", vendedor2Password, "Lucía", "Morales Rivas", "lucia.morales@farmaochenta.pe", "ROLE_VENDEDOR");
        sincronizarUsuario("almacenero", almaceneroPassword, "Roberto", "Quispe Tello", "roberto.quispe@farmaochenta.pe", "ROLE_ALMACENERO");

        log.info("Sincronización de credenciales iniciales completada exitosamente.");
    }

    private void sincronizarUsuario(String username, String rawPassword, String nombres, String apellidos, String email, String rolNombre) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        Usuario usuario;

        if (usuarioOpt.isPresent()) {
            usuario = usuarioOpt.get();
        } else {
            usuario = new Usuario();
            usuario.setUsername(username);
            usuario.setNombres(nombres);
            usuario.setApellidos(apellidos);
            usuario.setEmail(email);
            usuario.setSucursalId(1);
            usuario.setActivo(true);
            rolRepository.findByNombre(rolNombre).ifPresent(r -> usuario.setRoles(Collections.singleton(r)));
        }

        usuario.setPasswordHash(passwordEncoder.encode(rawPassword));
        usuarioRepository.save(usuario);
        log.info("Usuario '{}' configurado con hash BCrypt actualizado.", username);
    }
}
