package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import pe.farmagest.ventas.entity.MedioPago;

import java.util.List;

public class EmitirNotaCreditoRequest {

    @NotNull(message = "El ID de la venta es obligatorio")
    private Long ventaId;

    private String tipoNotaCredito = "07";

    @NotBlank(message = "El motivo de la nota de crédito es obligatorio según normativa SUNAT")
    private String motivoSustento;

    private MedioPago medioReembolso;

    @NotEmpty(message = "Debe especificar al menos un ítem a devolver")
    private List<ItemDevolucionRequest> items;

    public EmitirNotaCreditoRequest() {}

    public Long getVentaId() { return ventaId; }
    public void setVentaId(Long ventaId) { this.ventaId = ventaId; }

    public String getTipoNotaCredito() { return tipoNotaCredito; }
    public void setTipoNotaCredito(String tipoNotaCredito) { this.tipoNotaCredito = tipoNotaCredito; }

    public String getMotivoSustento() { return motivoSustento; }
    public void setMotivoSustento(String motivoSustento) { this.motivoSustento = motivoSustento; }

    public MedioPago getMedioReembolso() { return medioReembolso; }
    public void setMedioReembolso(MedioPago medioReembolso) { this.medioReembolso = medioReembolso; }

    public List<ItemDevolucionRequest> getItems() { return items; }
    public void setItems(List<ItemDevolucionRequest> items) { this.items = items; }
}
