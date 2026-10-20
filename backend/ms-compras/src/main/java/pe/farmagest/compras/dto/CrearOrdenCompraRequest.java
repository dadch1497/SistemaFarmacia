package pe.farmagest.compras.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CrearOrdenCompraRequest {

    @NotNull(message = "El proveedor es obligatorio")
    private Integer proveedorId;

    private Integer sucursalId = 1;

    private LocalDate fechaEsperada;

    private String observaciones;

    @NotEmpty(message = "La orden de compra debe contener al menos un producto")
    @Valid
    private List<ItemOrdenRequest> items;

    public CrearOrdenCompraRequest() {}

    public Integer getProveedorId() { return proveedorId; }
    public void setProveedorId(Integer proveedorId) { this.proveedorId = proveedorId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public LocalDate getFechaEsperada() { return fechaEsperada; }
    public void setFechaEsperada(LocalDate fechaEsperada) { this.fechaEsperada = fechaEsperada; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<ItemOrdenRequest> getItems() { return items; }
    public void setItems(List<ItemOrdenRequest> items) { this.items = items; }

    public static class ItemOrdenRequest {
        @NotNull(message = "El ID del producto es obligatorio")
        private Long productoId;

        @NotNull(message = "La cantidad solicitada es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        private Integer cantidadSolicitada;

        @NotNull(message = "El costo pactado es obligatorio")
        @Positive(message = "El costo debe ser mayor a 0")
        private BigDecimal costoPactado;

        public ItemOrdenRequest() {}

        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }

        public Integer getCantidadSolicitada() { return cantidadSolicitada; }
        public void setCantidadSolicitada(Integer cantidadSolicitada) { this.cantidadSolicitada = cantidadSolicitada; }

        public BigDecimal getCostoPactado() { return costoPactado; }
        public void setCostoPactado(BigDecimal costoPactado) { this.costoPactado = costoPactado; }
    }
}
