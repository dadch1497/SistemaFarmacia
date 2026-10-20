package pe.farmagest.reportes.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_auditoria")
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "rol", nullable = false, length = 50)
    private String rol;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Column(name = "entidad_afectada", nullable = false, length = 50)
    private String entidadAfectada;

    @Column(name = "registro_id", nullable = false, length = 50)
    private String registroId;

    @Column(name = "valor_anterior", columnDefinition = "TEXT")
    private String valorAnterior;

    @Column(name = "valor_nuevo", columnDefinition = "TEXT")
    private String valorNuevo;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora = LocalDateTime.now();

    public LogAuditoria() {}

    public LogAuditoria(Integer sucursalId, Long usuarioId, String username, String rol,
                        String accion, String entidadAfectada, String registroId,
                        String valorAnterior, String valorNuevo, String ipOrigen) {
        this.sucursalId = sucursalId != null ? sucursalId : 1;
        this.usuarioId = usuarioId != null ? usuarioId : 1L;
        this.username = username != null ? username : "sistema";
        this.rol = rol != null ? rol : "ROLE_ADMINISTRADOR";
        this.accion = accion;
        this.entidadAfectada = entidadAfectada;
        this.registroId = registroId;
        this.valorAnterior = valorAnterior;
        this.valorNuevo = valorNuevo;
        this.ipOrigen = ipOrigen;
        this.fechaHora = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getEntidadAfectada() { return entidadAfectada; }
    public void setEntidadAfectada(String entidadAfectada) { this.entidadAfectada = entidadAfectada; }

    public String getRegistroId() { return registroId; }
    public void setRegistroId(String registroId) { this.registroId = registroId; }

    public String getValorAnterior() { return valorAnterior; }
    public void setValorAnterior(String valorAnterior) { this.valorAnterior = valorAnterior; }

    public String getValorNuevo() { return valorNuevo; }
    public void setValorNuevo(String valorNuevo) { this.valorNuevo = valorNuevo; }

    public String getIpOrigen() { return ipOrigen; }
    public void setIpOrigen(String ipOrigen) { this.ipOrigen = ipOrigen; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}
