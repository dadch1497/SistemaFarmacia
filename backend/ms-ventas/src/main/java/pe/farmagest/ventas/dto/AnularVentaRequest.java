package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotBlank;

public class AnularVentaRequest {

    @NotBlank(message = "El motivo de la anulación es obligatorio")
    private String motivo;

    public AnularVentaRequest() {}

    public AnularVentaRequest(String motivo) {
        this.motivo = motivo;
    }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
