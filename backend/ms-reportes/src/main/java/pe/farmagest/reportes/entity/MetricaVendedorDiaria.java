package pe.farmagest.reportes.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "metrica_vendedor_diaria", uniqueConstraints = {
        @UniqueConstraint(name = "uk_sucursal_fecha_vendedor", columnNames = {"sucursal_id", "fecha", "usuario_id"})
})
public class MetricaVendedorDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "nombre_vendedor", nullable = false, length = 150)
    private String nombreVendedor;

    @Column(name = "monto_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotal = BigDecimal.ZERO;

    @Column(name = "total_ventas", nullable = false)
    private Integer totalVentas = 0;

    public MetricaVendedorDiaria() {}

    public MetricaVendedorDiaria(Integer sucursalId, LocalDate fecha, Long usuarioId, String nombreVendedor) {
        this.sucursalId = sucursalId;
        this.fecha = fecha;
        this.usuarioId = usuarioId;
        this.nombreVendedor = nombreVendedor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getNombreVendedor() { return nombreVendedor; }
    public void setNombreVendedor(String nombreVendedor) { this.nombreVendedor = nombreVendedor; }

    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }

    public Integer getTotalVentas() { return totalVentas; }
    public void setTotalVentas(Integer totalVentas) { this.totalVentas = totalVentas; }
}
