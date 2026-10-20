package pe.farmagest.ventas.dto;

import java.time.LocalDateTime;

public class VentaEsperaDto {
    private Long id;
    private Long usuarioId;
    private Integer sucursalId;
    private String codigoEspera;
    private String nombreReferencia;
    private String datosJson;
    private LocalDateTime fechaHora;

    public VentaEsperaDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public String getCodigoEspera() { return codigoEspera; }
    public void setCodigoEspera(String codigoEspera) { this.codigoEspera = codigoEspera; }

    public String getNombreReferencia() { return nombreReferencia; }
    public void setNombreReferencia(String nombreReferencia) { this.nombreReferencia = nombreReferencia; }

    public String getDatosJson() { return datosJson; }
    public void setDatosJson(String datosJson) { this.datosJson = datosJson; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}
