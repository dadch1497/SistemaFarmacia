package pe.farmagest.compras.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "detalle_ingreso")
public class DetalleIngreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingreso_id", nullable = false)
    @JsonIgnore
    private IngresoMercaderia ingreso;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "numero_lote", nullable = false, length = 50)
    private String numeroLote;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "cantidad_recibida", nullable = false)
    private Integer cantidadRecibida;

    @Column(name = "costo_unitario_real", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoUnitarioReal;

    public DetalleIngreso() {}

    public DetalleIngreso(Long productoId, String numeroLote, LocalDate fechaVencimiento,
                          Integer cantidadRecibida, BigDecimal costoUnitarioReal) {
        this.productoId = productoId;
        this.numeroLote = numeroLote;
        this.fechaVencimiento = fechaVencimiento;
        this.cantidadRecibida = cantidadRecibida;
        this.costoUnitarioReal = costoUnitarioReal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public IngresoMercaderia getIngreso() { return ingreso; }
    public void setIngreso(IngresoMercaderia ingreso) { this.ingreso = ingreso; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public Integer getCantidadRecibida() { return cantidadRecibida; }
    public void setCantidadRecibida(Integer cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }

    public BigDecimal getCostoUnitarioReal() { return costoUnitarioReal; }
    public void setCostoUnitarioReal(BigDecimal costoUnitarioReal) { this.costoUnitarioReal = costoUnitarioReal; }
}
