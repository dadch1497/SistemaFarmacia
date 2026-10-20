package pe.farmagest.inventario.dto;

import java.time.LocalDateTime;

public class StockProductoResponse {
    private Long id;
    private Long productoId;
    private Integer sucursalId;
    private Integer stockActual;
    private Integer stockMinimo;
    private Integer stockMaximo;
    private String estadoStock; // OPTIMO, BAJO, CRITICO
    private LocalDateTime actualizadoEn;

    public StockProductoResponse() {}

    public StockProductoResponse(Long id, Long productoId, Integer sucursalId, Integer stockActual,
                                 Integer stockMinimo, Integer stockMaximo, LocalDateTime actualizadoEn) {
        this.id = id;
        this.productoId = productoId;
        this.sucursalId = sucursalId;
        this.stockActual = stockActual;
        this.stockMinimo = stockMinimo;
        this.stockMaximo = stockMaximo;
        this.actualizadoEn = actualizadoEn;
        if (stockActual <= 0) {
            this.estadoStock = "CRITICO";
        } else if (stockActual <= stockMinimo) {
            this.estadoStock = "BAJO";
        } else {
            this.estadoStock = "OPTIMO";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }

    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }

    public Integer getStockMaximo() { return stockMaximo; }
    public void setStockMaximo(Integer stockMaximo) { this.stockMaximo = stockMaximo; }

    public String getEstadoStock() { return estadoStock; }
    public void setEstadoStock(String estadoStock) { this.estadoStock = estadoStock; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
