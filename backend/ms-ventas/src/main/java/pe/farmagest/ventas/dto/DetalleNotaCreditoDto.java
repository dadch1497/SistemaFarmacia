package pe.farmagest.ventas.dto;

import java.math.BigDecimal;

public class DetalleNotaCreditoDto {

    private Long id;
    private Long productoId;
    private String nombreProducto;
    private Long loteId;
    private String numeroLote;
    private Integer cantidadDevuelta;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private Boolean reingresaAStock;

    public DetalleNotaCreditoDto() {}

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

    public Integer getCantidadDevuelta() { return cantidadDevuelta; }
    public void setCantidadDevuelta(Integer cantidadDevuelta) { this.cantidadDevuelta = cantidadDevuelta; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public Boolean getReingresaAStock() { return reingresaAStock; }
    public void setReingresaAStock(Boolean reingresaAStock) { this.reingresaAStock = reingresaAStock; }
}
