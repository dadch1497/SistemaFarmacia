package pe.farmagest.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DespachoFefoRequest {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    private Integer sucursalId = 1;

    @NotNull(message = "La cantidad a despachar es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    private Long ventaId;
    private String numeroComprobante;

    public DespachoFefoRequest() {}

    public DespachoFefoRequest(Long productoId, Integer sucursalId, Integer cantidad, Long ventaId, String numeroComprobante) {
        this.productoId = productoId;
        this.sucursalId = sucursalId;
        this.cantidad = cantidad;
        this.ventaId = ventaId;
        this.numeroComprobante = numeroComprobante;
    }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Long getVentaId() { return ventaId; }
    public void setVentaId(Long ventaId) { this.ventaId = ventaId; }

    public String getNumeroComprobante() { return numeroComprobante; }
    public void setNumeroComprobante(String numeroComprobante) { this.numeroComprobante = numeroComprobante; }

    // --- Inner class response ---
    public static class DespachoItem {
        private Long loteId;
        private String numeroLote;
        private Integer cantidadTomada;
        private BigDecimal costoUnitario;

        public DespachoItem() {}
        public DespachoItem(Long loteId, String numeroLote, Integer cantidadTomada, BigDecimal costoUnitario) {
            this.loteId = loteId;
            this.numeroLote = numeroLote;
            this.cantidadTomada = cantidadTomada;
            this.costoUnitario = costoUnitario;
        }

        public Long getLoteId() { return loteId; }
        public void setLoteId(Long loteId) { this.loteId = loteId; }
        public String getNumeroLote() { return numeroLote; }
        public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }
        public Integer getCantidadTomada() { return cantidadTomada; }
        public void setCantidadTomada(Integer cantidadTomada) { this.cantidadTomada = cantidadTomada; }
        public BigDecimal getCostoUnitario() { return costoUnitario; }
        public void setCostoUnitario(BigDecimal costoUnitario) { this.costoUnitario = costoUnitario; }
    }

    public static class DespachoResult {
        private Long productoId;
        private Integer cantidadSolicitada;
        private Integer cantidadDespachada;
        private Integer stockRemanente;
        private List<DespachoItem> items = new ArrayList<>();

        public DespachoResult() {}
        public DespachoResult(Long productoId, Integer cantidadSolicitada, Integer cantidadDespachada, Integer stockRemanente) {
            this.productoId = productoId;
            this.cantidadSolicitada = cantidadSolicitada;
            this.cantidadDespachada = cantidadDespachada;
            this.stockRemanente = stockRemanente;
        }

        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }
        public Integer getCantidadSolicitada() { return cantidadSolicitada; }
        public void setCantidadSolicitada(Integer cantidadSolicitada) { this.cantidadSolicitada = cantidadSolicitada; }
        public Integer getCantidadDespachada() { return cantidadDespachada; }
        public void setCantidadDespachada(Integer cantidadDespachada) { this.cantidadDespachada = cantidadDespachada; }
        public Integer getStockRemanente() { return stockRemanente; }
        public void setStockRemanente(Integer stockRemanente) { this.stockRemanente = stockRemanente; }
        public List<DespachoItem> getItems() { return items; }
        public void setItems(List<DespachoItem> items) { this.items = items; }
    }
}
