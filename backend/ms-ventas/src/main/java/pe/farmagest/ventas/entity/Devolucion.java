package pe.farmagest.ventas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "devolucion")
public class Devolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(nullable = false)
    private String motivo;

    @Column(name = "total_devuelto", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDevuelto;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @OneToMany(mappedBy = "devolucion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleDevolucion> detalles = new ArrayList<>();

    public Devolucion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Venta getVenta() { return venta; }
    public void setVenta(Venta venta) { this.venta = venta; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public BigDecimal getTotalDevuelto() { return totalDevuelto; }
    public void setTotalDevuelto(BigDecimal totalDevuelto) { this.totalDevuelto = totalDevuelto; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public List<DetalleDevolucion> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleDevolucion> detalles) { this.detalles = detalles; }

    public void agregarDetalle(DetalleDevolucion detalle) {
        detalles.add(detalle);
        detalle.setDevolucion(this);
    }
}
