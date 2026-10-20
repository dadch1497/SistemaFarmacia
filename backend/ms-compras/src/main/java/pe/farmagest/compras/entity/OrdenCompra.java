package pe.farmagest.compras.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orden_compra", uniqueConstraints = {
        @UniqueConstraint(name = "uk_orden_compra_numero", columnNames = "numero_orden")
})
public class OrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_orden", nullable = false, length = 30)
    private String numeroOrden;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoOrden estado = EstadoOrden.PENDIENTE;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "igv", nullable = false, precision = 10, scale = 2)
    private BigDecimal igv = BigDecimal.ZERO;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "usuario_creador_id", nullable = false)
    private Long usuarioCreadorId;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "fecha_esperada")
    private LocalDate fechaEsperada;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @OneToMany(mappedBy = "ordenCompra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleOrdenCompra> detalles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.fechaEmision == null) {
            this.fechaEmision = LocalDateTime.now();
        }
    }

    public OrdenCompra() {}

    public void addDetalle(DetalleOrdenCompra detalle) {
        detalles.add(detalle);
        detalle.setOrdenCompra(this);
    }

    public void calcularTotales() {
        BigDecimal sumSubtotal = BigDecimal.ZERO;
        for (DetalleOrdenCompra d : detalles) {
            sumSubtotal = sumSubtotal.add(d.getSubtotal() != null ? d.getSubtotal() : BigDecimal.ZERO);
        }
        this.subtotal = sumSubtotal;
        this.igv = this.subtotal.multiply(new BigDecimal("0.18")).setScale(2, java.math.RoundingMode.HALF_UP);
        this.total = this.subtotal.add(this.igv);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }

    public Proveedor getProveedor() { return proveedor; }
    public void setProveedor(Proveedor proveedor) { this.proveedor = proveedor; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public EstadoOrden getEstado() { return estado; }
    public void setEstado(EstadoOrden estado) { this.estado = estado; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getIgv() { return igv; }
    public void setIgv(BigDecimal igv) { this.igv = igv; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public Long getUsuarioCreadorId() { return usuarioCreadorId; }
    public void setUsuarioCreadorId(Long usuarioCreadorId) { this.usuarioCreadorId = usuarioCreadorId; }

    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }

    public LocalDate getFechaEsperada() { return fechaEsperada; }
    public void setFechaEsperada(LocalDate fechaEsperada) { this.fechaEsperada = fechaEsperada; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<DetalleOrdenCompra> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleOrdenCompra> detalles) { this.detalles = detalles; }
}
