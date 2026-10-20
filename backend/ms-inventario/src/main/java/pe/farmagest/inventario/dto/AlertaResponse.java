package pe.farmagest.inventario.dto;

import pe.farmagest.inventario.entity.TipoAlerta;
import java.time.LocalDateTime;

public class AlertaResponse {
    private Long id;
    private Long productoId;
    private Long loteId;
    private String numeroLote;
    private Integer sucursalId;
    private TipoAlerta tipoAlerta;
    private String mensaje;
    private Integer nivelUrgencia;
    private Boolean atendida;
    private LocalDateTime fechaAlerta;

    public AlertaResponse() {}

    public AlertaResponse(Long id, Long productoId, Long loteId, String numeroLote, Integer sucursalId,
                          TipoAlerta tipoAlerta, String mensaje, Integer nivelUrgencia,
                          Boolean atendida, LocalDateTime fechaAlerta) {
        this.id = id;
        this.productoId = productoId;
        this.loteId = loteId;
        this.numeroLote = numeroLote;
        this.sucursalId = sucursalId;
        this.tipoAlerta = tipoAlerta;
        this.mensaje = mensaje;
        this.nivelUrgencia = nivelUrgencia;
        this.atendida = atendida;
        this.fechaAlerta = fechaAlerta;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }

    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public TipoAlerta getTipoAlerta() { return tipoAlerta; }
    public void setTipoAlerta(TipoAlerta tipoAlerta) { this.tipoAlerta = tipoAlerta; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public Integer getNivelUrgencia() { return nivelUrgencia; }
    public void setNivelUrgencia(Integer nivelUrgencia) { this.nivelUrgencia = nivelUrgencia; }

    public Boolean getAtendida() { return atendida; }
    public void setAtendida(Boolean atendida) { this.atendida = atendida; }

    public LocalDateTime getFechaAlerta() { return fechaAlerta; }
    public void setFechaAlerta(LocalDateTime fechaAlerta) { this.fechaAlerta = fechaAlerta; }
}
