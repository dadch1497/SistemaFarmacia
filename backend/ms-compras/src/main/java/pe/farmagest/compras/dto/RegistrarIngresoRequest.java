package pe.farmagest.compras.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class RegistrarIngresoRequest {

    @NotBlank(message = "El número de guía de remisión es obligatorio")
    private String numeroGuia;

    private String numeroFacturaProveedor;

    private Long ordenCompraId;

    private Integer sucursalId = 1;

    private String observaciones;

    @NotEmpty(message = "Debe registrar al menos un producto recibido con su lote")
    @Valid
    private List<ItemIngresoRequest> items;

    public RegistrarIngresoRequest() {}

    public String getNumeroGuia() { return numeroGuia; }
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }

    public String getNumeroFacturaProveedor() { return numeroFacturaProveedor; }
    public void setNumeroFacturaProveedor(String numeroFacturaProveedor) { this.numeroFacturaProveedor = numeroFacturaProveedor; }

    public Long getOrdenCompraId() { return ordenCompraId; }
    public void setOrdenCompraId(Long ordenCompraId) { this.ordenCompraId = ordenCompraId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<ItemIngresoRequest> getItems() { return items; }
    public void setItems(List<ItemIngresoRequest> items) { this.items = items; }

    public static class ItemIngresoRequest {
        @NotNull(message = "El ID del producto es obligatorio")
        private Long productoId;

        @NotBlank(message = "El número de lote del laboratorio es obligatorio")
        private String numeroLote;

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        private LocalDate fechaVencimiento;

        @NotNull(message = "La cantidad recibida es obligatoria")
        @Positive(message = "La cantidad recibida debe ser mayor a 0")
        private Integer cantidadRecibida;

        @NotNull(message = "El costo unitario real es obligatorio")
        @Positive(message = "El costo debe ser mayor a 0")
        private BigDecimal costoUnitarioReal;

        public ItemIngresoRequest() {}

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
}
