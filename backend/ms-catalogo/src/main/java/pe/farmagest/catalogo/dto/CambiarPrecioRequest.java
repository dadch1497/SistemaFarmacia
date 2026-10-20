package pe.farmagest.catalogo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CambiarPrecioRequest {

    @NotNull(message = "El nuevo precio de venta es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio de venta debe ser mayor a cero")
    private BigDecimal nuevoPrecioVenta;

    private BigDecimal nuevoPrecioCosto;

    @NotBlank(message = "El motivo del cambio de precio es obligatorio para auditoría")
    private String motivo;

    public CambiarPrecioRequest() {
    }

    public BigDecimal getNuevoPrecioVenta() {
        return nuevoPrecioVenta;
    }

    public void setNuevoPrecioVenta(BigDecimal nuevoPrecioVenta) {
        this.nuevoPrecioVenta = nuevoPrecioVenta;
    }

    public BigDecimal getNuevoPrecioCosto() {
        return nuevoPrecioCosto;
    }

    public void setNuevoPrecioCosto(BigDecimal nuevoPrecioCosto) {
        this.nuevoPrecioCosto = nuevoPrecioCosto;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
