package pe.farmagest.inventario.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerta_inventario", indexes = {
        @Index(name = "idx_alerta_urgencia", columnList = "atendida, nivel_urgencia")
})
public class AlertaInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    private Lote lote;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alerta", nullable = false, length = 40)
    private TipoAlerta tipoAlerta;

    @Column(name = "mensaje", nullable = false, length = 255)
    private String mensaje;

    @Column(name = "nivel_urgencia", nullable = false)
    private Integer nivelUrgencia = 1; // 1: Info, 2: Advertencia, 3: Crítico

    @Column(name = "atendida", nullable = false)
    private Boolean atendida = false;

    @Column(name = "fecha_alerta", nullable = false)
    private LocalDateTime fechaAlerta;

    @PrePersist
    protected void onCreate() {
        if (this.fechaAlerta == null) {
            this.fechaAlerta = LocalDateTime.now();
        }
    }

    public AlertaInventario() {}

    public AlertaInventario(Long productoId, Lote lote, Integer sucursalId, TipoAlerta tipoAlerta,
                            String mensaje, Integer nivelUrgencia) {
        this.productoId = productoId;
        this.lote = lote;
        this.sucursalId = sucursalId;
        this.tipoAlerta = tipoAlerta;
        this.mensaje = mensaje;
        this.nivelUrgencia = nivelUrgencia;
        this.atendida = false;
        this.fechaAlerta = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public Lote getLote() {
        return lote;
    }

    public void setLote(Lote lote) {
        this.lote = lote;
    }

    public Integer getSucursalId() {
        return sucursalId;
    }

    public void setSucursalId(Integer sucursalId) {
        this.sucursalId = sucursalId;
    }

    public TipoAlerta getTipoAlerta() {
        return tipoAlerta;
    }

    public void setTipoAlerta(TipoAlerta tipoAlerta) {
        this.tipoAlerta = tipoAlerta;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Integer getNivelUrgencia() {
        return nivelUrgencia;
    }

    public void setNivelUrgencia(Integer nivelUrgencia) {
        this.nivelUrgencia = nivelUrgencia;
    }

    public Boolean getAtendida() {
        return atendida;
    }

    public void setAtendida(Boolean atendida) {
        this.atendida = atendida;
    }

    public LocalDateTime getFechaAlerta() {
        return fechaAlerta;
    }

    public void setFechaAlerta(LocalDateTime fechaAlerta) {
        this.fechaAlerta = fechaAlerta;
    }
}
