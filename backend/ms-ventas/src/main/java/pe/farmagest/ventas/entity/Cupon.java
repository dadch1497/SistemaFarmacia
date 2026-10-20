package pe.farmagest.ventas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cupon")
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promocion_id")
    private Promocion promocion;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(name = "porcentaje_descuento", precision = 5, scale = 2, nullable = false)
    private BigDecimal porcentajeDescuento = BigDecimal.ZERO;

    @Column(name = "monto_fijo_descuento", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoFijoDescuento = BigDecimal.ZERO;

    @Column(name = "usos_permitidos", nullable = false)
    private Integer usosPermitidos = 100;

    @Column(name = "usos_actuales", nullable = false)
    private Integer usosActuales = 0;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDate fechaExpiracion;

    @Column(nullable = false)
    private Boolean activo = true;

    public Cupon() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Promocion getPromocion() { return promocion; }
    public void setPromocion(Promocion promocion) { this.promocion = promocion; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public BigDecimal getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(BigDecimal porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    public BigDecimal getMontoFijoDescuento() { return montoFijoDescuento; }
    public void setMontoFijoDescuento(BigDecimal montoFijoDescuento) { this.montoFijoDescuento = montoFijoDescuento; }

    public Integer getUsosPermitidos() { return usosPermitidos; }
    public void setUsosPermitidos(Integer usosPermitidos) { this.usosPermitidos = usosPermitidos; }

    public Integer getUsosActuales() { return usosActuales; }
    public void setUsosActuales(Integer usosActuales) { this.usosActuales = usosActuales; }

    public LocalDate getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(LocalDate fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
