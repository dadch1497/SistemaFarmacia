package pe.farmagest.reportes.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumen_venta_diaria", uniqueConstraints = {
        @UniqueConstraint(name = "uk_sucursal_fecha", columnNames = {"sucursal_id", "fecha"})
})
public class ResumenVentaDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "total_ventas", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalVentas = BigDecimal.ZERO;

    @Column(name = "total_costo", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCosto = BigDecimal.ZERO;

    @Column(name = "total_utilidad", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalUtilidad = BigDecimal.ZERO;

    @Column(name = "cantidad_transacciones", nullable = false)
    private Integer cantidadTransacciones = 0;

    @Column(name = "ticket_promedio", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPromedio = BigDecimal.ZERO;

    @Column(name = "total_unidades_vendidas", nullable = false)
    private Integer totalUnidadesVendidas = 0;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn = LocalDateTime.now();

    public ResumenVentaDiaria() {}

    public ResumenVentaDiaria(Integer sucursalId, LocalDate fecha) {
        this.sucursalId = sucursalId;
        this.fecha = fecha;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public BigDecimal getTotalVentas() { return totalVentas; }
    public void setTotalVentas(BigDecimal totalVentas) { this.totalVentas = totalVentas; }

    public BigDecimal getTotalCosto() { return totalCosto; }
    public void setTotalCosto(BigDecimal totalCosto) { this.totalCosto = totalCosto; }

    public BigDecimal getTotalUtilidad() { return totalUtilidad; }
    public void setTotalUtilidad(BigDecimal totalUtilidad) { this.totalUtilidad = totalUtilidad; }

    public Integer getCantidadTransacciones() { return cantidadTransacciones; }
    public void setCantidadTransacciones(Integer cantidadTransacciones) { this.cantidadTransacciones = cantidadTransacciones; }

    public BigDecimal getTicketPromedio() { return ticketPromedio; }
    public void setTicketPromedio(BigDecimal ticketPromedio) { this.ticketPromedio = ticketPromedio; }

    public Integer getTotalUnidadesVendidas() { return totalUnidadesVendidas; }
    public void setTotalUnidadesVendidas(Integer totalUnidadesVendidas) { this.totalUnidadesVendidas = totalUnidadesVendidas; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
