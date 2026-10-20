package pe.farmagest.inventario.dto;

import pe.farmagest.inventario.entity.TipoMovimiento;
import java.time.LocalDateTime;

public class KardexResponse {
    private Long id;
    private Long productoId;
    private Long loteId;
    private String numeroLote;
    private Integer sucursalId;
    private TipoMovimiento tipoMovimiento;
    private Integer cantidad;
    private Integer saldoResultante;
    private String referenciaTipo;
    private String referenciaId;
    private String motivo;
    private Long usuarioId;
    private LocalDateTime fechaHora;

    public KardexResponse() {}

    public KardexResponse(Long id, Long productoId, Long loteId, String numeroLote, Integer sucursalId,
                          TipoMovimiento tipoMovimiento, Integer cantidad, Integer saldoResultante,
                          String referenciaTipo, String referenciaId, String motivo, Long usuarioId,
                          LocalDateTime fechaHora) {
        this.id = id;
        this.productoId = productoId;
        this.loteId = loteId;
        this.numeroLote = numeroLote;
        this.sucursalId = sucursalId;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.saldoResultante = saldoResultante;
        this.referenciaTipo = referenciaTipo;
        this.referenciaId = referenciaId;
        this.motivo = motivo;
        this.usuarioId = usuarioId;
        this.fechaHora = fechaHora;
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

    public TipoMovimiento getTipoMovimiento() { return tipoMovimiento; }
    public void setTipoMovimiento(TipoMovimiento tipoMovimiento) { this.tipoMovimiento = tipoMovimiento; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Integer getSaldoResultante() { return saldoResultante; }
    public void setSaldoResultante(Integer saldoResultante) { this.saldoResultante = saldoResultante; }

    public String getReferenciaTipo() { return referenciaTipo; }
    public void setReferenciaTipo(String referenciaTipo) { this.referenciaTipo = referenciaTipo; }

    public String getReferenciaId() { return referenciaId; }
    public void setReferenciaId(String referenciaId) { this.referenciaId = referenciaId; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}
