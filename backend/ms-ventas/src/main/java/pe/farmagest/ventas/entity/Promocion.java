package pe.farmagest.ventas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "promocion")
public class Promocion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alcance", nullable = false, length = 30)
    private TipoAlcance tipoAlcance = TipoAlcance.POR_PRODUCTO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_descuento", nullable = false, length = 20)
    private TipoDescuento tipoDescuento = TipoDescuento.PORCENTAJE;

    @Column(name = "valor_descuento", precision = 10, scale = 2)
    private BigDecimal valorDescuento;

    @Column(name = "cantidad_condicion")
    private Integer cantidadCondicion;

    @Column(name = "cantidad_pagada")
    private Integer cantidadPagada;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "aplica_por_vencimiento", nullable = false)
    private Boolean aplicaPorVencimiento = false;

    @Column(nullable = false)
    private Boolean activo = true;

    public Promocion() {}

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
