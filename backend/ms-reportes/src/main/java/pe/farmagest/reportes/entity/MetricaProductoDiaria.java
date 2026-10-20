package pe.farmagest.reportes.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "metrica_producto_diaria", uniqueConstraints = {
        @UniqueConstraint(name = "uk_sucursal_fecha_prod", columnNames = {"sucursal_id", "fecha", "producto_id"})
})
public class MetricaProductoDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "nombre_producto", nullable = false, length = 200)
    private String nombreProducto;

    @Column(name = "unidades_vendidas", nullable = false)
    private Integer unidadesVendidas = 0;

    @Column(name = "monto_vendido", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoVendido = BigDecimal.ZERO;

    @Column(name = "utilidad_generada", nullable = false, precision = 12, scale = 2)
    private BigDecimal utilidadGenerada = BigDecimal.ZERO;

    public MetricaProductoDiaria() {}

    public MetricaProductoDiaria(Integer sucursalId, LocalDate fecha, Long productoId, String nombreProducto) {
        this.sucursalId = sucursalId;
        this.fecha = fecha;
        this.productoId = productoId;
        this.nombreProducto = nombreProducto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public Integer getUnidadesVendidas() { return unidadesVendidas; }
    public void setUnidadesVendidas(Integer unidadesVendidas) { this.unidadesVendidas = unidadesVendidas; }

    public BigDecimal getMontoVendido() { return montoVendido; }
    public void setMontoVendido(BigDecimal montoVendido) { this.montoVendido = montoVendido; }

    public BigDecimal getUtilidadGenerada() { return utilidadGenerada; }
    public void setUtilidadGenerada(BigDecimal utilidadGenerada) { this.utilidadGenerada = utilidadGenerada; }
}
