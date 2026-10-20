package pe.farmagest.compras.dto;

import java.math.BigDecimal;

public class DetalleOrdenDto {
    private Long id;
    private Long productoId;
    private Integer cantidadSolicitada;
    private BigDecimal costoPactado;
    private BigDecimal subtotal;

    public DetalleOrdenDto() {}

    public DetalleOrdenDto(Long id, Long productoId, Integer cantidadSolicitada, BigDecimal costoPactado, BigDecimal subtotal) {
        this.id = id;
        this.productoId = productoId;
        this.cantidadSolicitada = cantidadSolicitada;
        this.costoPactado = costoPactado;
        this.subtotal = subtotal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getCantidadSolicitada() { return cantidadSolicitada; }
    public void setCantidadSolicitada(Integer cantidadSolicitada) { this.cantidadSolicitada = cantidadSolicitada; }

    public BigDecimal getCostoPactado() { return costoPactado; }
    public void setCostoPactado(BigDecimal costoPactado) { this.costoPactado = costoPactado; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
