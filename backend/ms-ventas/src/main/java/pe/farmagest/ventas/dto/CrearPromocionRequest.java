package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.farmagest.ventas.entity.TipoAlcance;
import pe.farmagest.ventas.entity.TipoDescuento;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CrearPromocionRequest {

    @NotBlank(message = "El nombre de la promoción es obligatorio")
    private String nombre;

    @NotNull(message = "El tipo de alcance es obligatorio")
    private TipoAlcance tipoAlcance;

    @NotNull(message = "El tipo de descuento es obligatorio")
    private TipoDescuento tipoDescuento;

    private BigDecimal valorDescuento;
    private Integer cantidadCondicion;
    private Integer cantidadPagada;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    private Boolean aplicaPorVencimiento = false;

    public CrearPromocionRequest() {}

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
}
