package pe.farmagest.reportes.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "metrica_pago_diaria", uniqueConstraints = {
        @UniqueConstraint(name = "uk_sucursal_fecha_pago", columnNames = {"sucursal_id", "fecha", "medio_pago"})
})
public class MetricaPagoDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "medio_pago", nullable = false, length = 30)
    private String medioPago;

    @Column(name = "monto_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotal = BigDecimal.ZERO;

    @Column(name = "total_transacciones", nullable = false)
    private Integer totalTransacciones = 0;

    public MetricaPagoDiaria() {}

    public MetricaPagoDiaria(Integer sucursalId, LocalDate fecha, String medioPago) {
        this.sucursalId = sucursalId;
        this.fecha = fecha;
        this.medioPago = medioPago;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getMedioPago() { return medioPago; }
    public void setMedioPago(String medioPago) { this.medioPago = medioPago; }

    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }

    public Integer getTotalTransacciones() { return totalTransacciones; }
    public void setTotalTransacciones(Integer totalTransacciones) { this.totalTransacciones = totalTransacciones; }
}
