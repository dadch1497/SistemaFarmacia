package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class AperturaCajaRequest {

    @NotNull(message = "El ID de la caja es obligatorio")
    private Integer cajaId;

    private Integer sucursalId = 1;

    @NotNull(message = "El monto de apertura es obligatorio")
    @PositiveOrZero(message = "El monto de apertura no puede ser negativo")
    private BigDecimal montoApertura;

    private String observaciones;

    public AperturaCajaRequest() {}

    public Integer getCajaId() { return cajaId; }
    public void setCajaId(Integer cajaId) { this.cajaId = cajaId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public BigDecimal getMontoApertura() { return montoApertura; }
    public void setMontoApertura(BigDecimal montoApertura) { this.montoApertura = montoApertura; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
