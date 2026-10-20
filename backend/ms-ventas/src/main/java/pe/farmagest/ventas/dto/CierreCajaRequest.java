package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class CierreCajaRequest {

    @NotNull(message = "El monto de arqueo físico es obligatorio")
    @PositiveOrZero(message = "El monto no puede ser negativo")
    private BigDecimal montoCierreReal;

    private String observaciones;

    public CierreCajaRequest() {}

    public BigDecimal getMontoCierreReal() { return montoCierreReal; }
    public void setMontoCierreReal(BigDecimal montoCierreReal) { this.montoCierreReal = montoCierreReal; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
