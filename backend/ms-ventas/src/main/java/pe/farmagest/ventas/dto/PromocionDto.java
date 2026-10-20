package pe.farmagest.ventas.dto;

import pe.farmagest.ventas.entity.TipoAlcance;
import pe.farmagest.ventas.entity.TipoDescuento;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PromocionDto {
    private Long id;
    private String nombre;
    private TipoAlcance tipoAlcance;
    private TipoDescuento tipoDescuento;
    private BigDecimal valorDescuento;
    private Integer cantidadCondicion;
    private Integer cantidadPagada;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean aplicaPorVencimiento;
    private Boolean activo;

    public PromocionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public TipoAlcance getTipoAlcance() { return tipoAlcance; }
    public void setTipoAlcance(TipoAlcance tipoAlcance) { this.tipoAlcance = tipoAlcance; }

    public TipoDescuento getTipoDescuento() { return tipoDescuento; }
    public void setTipoDescuento(TipoDescuento tipoDescuento) { this.tipoDescuento = tipoDescuento; }

    public BigDecimal getValorDescuento() { return valorDescuento; }
    public void setValorDescuento(BigDecimal valorDescuento) { this.valorDescuento = valorDescuento; }

    public Integer getCantidadCondicion() { return cantidadCondicion; }
    public void setCantidadCondicion(Integer cantidadCondicion) { this.cantidadCondicion = cantidadCondicion; }

    public Integer getCantidadPagada() { return cantidadPagada; }
    public void setCantidadPagada(Integer cantidadPagada) { this.cantidadPagada = cantidadPagada; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public Boolean getAplicaPorVencimiento() { return aplicaPorVencimiento; }
    public void setAplicaPorVencimiento(Boolean aplicaPorVencimiento) { this.aplicaPorVencimiento = aplicaPorVencimiento; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
