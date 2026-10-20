package pe.farmagest.auth.dto;

import java.util.List;

public class LoginResponse {

    private String token;
    private String tipo = "Bearer";
    private Long expiracionMs;
    private UsuarioInfo usuario;

    public static class UsuarioInfo {
        private Long id;
        private String username;
        private String nombres;
        private String apellidos;
        private String email;
        private String rolPrincipal;
        private Integer sucursalId;
        private List<String> roles;
        private List<String> permisos;

        public UsuarioInfo() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getNombres() {
            return nombres;
        }

        public void setNombres(String nombres) {
            this.nombres = nombres;
        }

        public String getApellidos() {
            return apellidos;
        }

        public void setApellidos(String apellidos) {
            this.apellidos = apellidos;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRolPrincipal() {
            return rolPrincipal;
        }

        public void setRolPrincipal(String rolPrincipal) {
            this.rolPrincipal = rolPrincipal;
        }

        public Integer getSucursalId() {
            return sucursalId;
        }

        public void setSucursalId(Integer sucursalId) {
            this.sucursalId = sucursalId;
        }

        public List<String> getRoles() {
            return roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }

        public List<String> getPermisos() {
            return permisos;
        }

        public void setPermisos(List<String> permisos) {
            this.permisos = permisos;
        }
    }

    public LoginResponse() {
    }

    public LoginResponse(String token, Long expiracionMs, UsuarioInfo usuario) {
        this.token = token;
        this.expiracionMs = expiracionMs;
        this.usuario = usuario;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Long getExpiracionMs() {
        return expiracionMs;
    }

    public void setExpiracionMs(Long expiracionMs) {
        this.expiracionMs = expiracionMs;
    }

    public UsuarioInfo getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioInfo usuario) {
        this.usuario = usuario;
    }
}
