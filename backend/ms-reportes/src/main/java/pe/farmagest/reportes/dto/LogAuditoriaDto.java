package pe.farmagest.reportes.dto;

import java.time.LocalDateTime;

public class LogAuditoriaDto {
    private Long id;
    private Integer sucursalId;
    private Long usuarioId;
    private String username;
    private String rol;
    private String accion;
    private String entidadAfectada;
    private String registroId;
    private String valorAnterior;
    private String valorNuevo;
    private String ipOrigen;
    private LocalDateTime fechaHora;

    public LogAuditoriaDto() {}

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
