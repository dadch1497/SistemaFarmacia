package pe.farmagest.ventas.dto;

import java.math.BigDecimal;

public class DetalleVentaDto {
    private Long id;
    private Long productoId;
    private String nombreProducto;
    private Long loteId;
    private String numeroLote;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal costoUnitario;
    private BigDecimal descuentoLinea;
    private BigDecimal subtotalLinea;

    public DetalleVentaDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }

    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getCostoUnitario() { return costoUnitario; }
    public void setCostoUnitario(BigDecimal costoUnitario) { this.costoUnitario = costoUnitario; }

    public BigDecimal getDescuentoLinea() { return descuentoLinea; }
    public void setDescuentoLinea(BigDecimal descuentoLinea) { this.descuentoLinea = descuentoLinea; }

    public BigDecimal getSubtotalLinea() { return subtotalLinea; }
    public void setSubtotalLinea(BigDecimal subtotalLinea) { this.subtotalLinea = subtotalLinea; }
}
