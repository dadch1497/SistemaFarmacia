package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ItemDevolucionRequest {

    private Long detalleVentaId;

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    private String nombreProducto;
    private Long loteId;
    private String numeroLote;

    @NotNull(message = "La cantidad a devolver es obligatoria")
    @Min(value = 1, message = "La cantidad a devolver debe ser al menos 1")
    private Integer cantidadDevuelta;

    private BigDecimal precioUnitario;
    private Boolean reingresaAStock = true;
    private String motivoItem;

    public ItemDevolucionRequest() {}

    public Long getDetalleVentaId() { return detalleVentaId; }
    public void setDetalleVentaId(Long detalleVentaId) { this.detalleVentaId = detalleVentaId; }

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

    public Boolean getReingresaAStock() { return reingresaAStock; }
    public void setReingresaAStock(Boolean reingresaAStock) { this.reingresaAStock = reingresaAStock; }

    public String getMotivoItem() { return motivoItem; }
    public void setMotivoItem(String motivoItem) { this.motivoItem = motivoItem; }
}
