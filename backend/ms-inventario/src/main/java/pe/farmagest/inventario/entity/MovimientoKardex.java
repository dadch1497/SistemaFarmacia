package pe.farmagest.inventario.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_kardex", indexes = {
        @Index(name = "idx_kardex_producto", columnList = "producto_id, fecha_hora")
})
public class MovimientoKardex {

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
    @Column(name = "tipo_movimiento", nullable = false, length = 30)
    private TipoMovimiento tipoMovimiento;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad; // Positivo (ingreso) o negativo (salida/merma)

    @Column(name = "saldo_resultante", nullable = false)
    private Integer saldoResultante;

    @Column(name = "referencia_tipo", length = 30)
    private String referenciaTipo;

    @Column(name = "referencia_id", length = 50)
    private String referenciaId;

    @Column(name = "motivo", length = 255)
    private String motivo;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @PrePersist
    protected void onCreate() {
        if (this.fechaHora == null) {
            this.fechaHora = LocalDateTime.now();
        }
    }

    public MovimientoKardex() {}

    public MovimientoKardex(Long productoId, Lote lote, Integer sucursalId, TipoMovimiento tipoMovimiento,
                            Integer cantidad, Integer saldoResultante, String referenciaTipo,
                            String referenciaId, String motivo, Long usuarioId) {
        this.productoId = productoId;
        this.lote = lote;
        this.sucursalId = sucursalId;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.saldoResultante = saldoResultante;
        this.referenciaTipo = referenciaTipo;
        this.referenciaId = referenciaId;
        this.motivo = motivo;
        this.usuarioId = usuarioId;
        this.fechaHora = LocalDateTime.now();
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

    public TipoMovimiento getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(TipoMovimiento tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Integer getSaldoResultante() {
        return saldoResultante;
    }

    public void setSaldoResultante(Integer saldoResultante) {
        this.saldoResultante = saldoResultante;
    }

    public String getReferenciaTipo() {
        return referenciaTipo;
    }

    public void setReferenciaTipo(String referenciaTipo) {
        this.referenciaTipo = referenciaTipo;
    }

    public String getReferenciaId() {
        return referenciaId;
    }

    public void setReferenciaId(String referenciaId) {
        this.referenciaId = referenciaId;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
}
