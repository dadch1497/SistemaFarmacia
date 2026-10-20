package pe.farmagest.compras.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DetalleIngresoDto {
    private Long id;
    private Long productoId;
    private String numeroLote;
    private LocalDate fechaVencimiento;
    private Integer cantidadRecibida;
    private BigDecimal costoUnitarioReal;

    public DetalleIngresoDto() {}

    public DetalleIngresoDto(Long id, Long productoId, String numeroLote, LocalDate fechaVencimiento,
                             Integer cantidadRecibida, BigDecimal costoUnitarioReal) {
        this.id = id;
        this.productoId = productoId;
        this.numeroLote = numeroLote;
        this.fechaVencimiento = fechaVencimiento;
        this.cantidadRecibida = cantidadRecibida;
        this.costoUnitarioReal = costoUnitarioReal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
