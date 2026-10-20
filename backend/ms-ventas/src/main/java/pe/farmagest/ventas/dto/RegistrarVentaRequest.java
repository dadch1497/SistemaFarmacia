package pe.farmagest.ventas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import pe.farmagest.ventas.entity.MedioPago;
import pe.farmagest.ventas.entity.TipoComprobante;

import java.math.BigDecimal;
import java.util.List;

public class RegistrarVentaRequest {

    private Integer sucursalId = 1;

    private Long sesionCajaId;

    private Long clienteId;

    // Si el cliente no existe aún, se puede registrar inline
    private String clienteTipoDocumento;
    private String clienteNumeroDocumento;
    private String clienteNombre;
    private String clienteDireccion;

    @NotNull(message = "El tipo de comprobante es obligatorio (BOLETA o FACTURA)")
    private TipoComprobante tipoComprobante = TipoComprobante.BOLETA;

    @NotNull(message = "El medio de pago es obligatorio")
    private MedioPago medioPago = MedioPago.EFECTIVO;

    private BigDecimal montoRecibido;

    private Long promocionId;

    private Long cuponId;

    private String cuponCodigo;

    private BigDecimal descuentoManual = BigDecimal.ZERO; // Max 5% para vendedor

    private String observaciones;

    @NotEmpty(message = "La venta debe contener al menos un producto")
    @Valid
    private List<ItemVentaRequest> items;

    public RegistrarVentaRequest() {}

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Long getSesionCajaId() { return sesionCajaId; }
    public void setSesionCajaId(Long sesionCajaId) { this.sesionCajaId = sesionCajaId; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getClienteTipoDocumento() { return clienteTipoDocumento; }
    public void setClienteTipoDocumento(String clienteTipoDocumento) { this.clienteTipoDocumento = clienteTipoDocumento; }

    public String getClienteNumeroDocumento() { return clienteNumeroDocumento; }
    public void setClienteNumeroDocumento(String clienteNumeroDocumento) { this.clienteNumeroDocumento = clienteNumeroDocumento; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getClienteDireccion() { return clienteDireccion; }
    public void setClienteDireccion(String clienteDireccion) { this.clienteDireccion = clienteDireccion; }

    public TipoComprobante getTipoComprobante() { return tipoComprobante; }
    public void setTipoComprobante(TipoComprobante tipoComprobante) { this.tipoComprobante = tipoComprobante; }

    public MedioPago getMedioPago() { return medioPago; }
    public void setMedioPago(MedioPago medioPago) { this.medioPago = medioPago; }

    public BigDecimal getMontoRecibido() { return montoRecibido; }
    public void setMontoRecibido(BigDecimal montoRecibido) { this.montoRecibido = montoRecibido; }

    public Long getPromocionId() { return promocionId; }
    public void setPromocionId(Long promocionId) { this.promocionId = promocionId; }

    public Long getCuponId() { return cuponId; }
    public void setCuponId(Long cuponId) { this.cuponId = cuponId; }

    public String getCuponCodigo() { return cuponCodigo; }
    public void setCuponCodigo(String cuponCodigo) { this.cuponCodigo = cuponCodigo; }

    public BigDecimal getDescuentoManual() { return descuentoManual; }
    public void setDescuentoManual(BigDecimal descuentoManual) { this.descuentoManual = descuentoManual; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<ItemVentaRequest> getItems() { return items; }
    public void setItems(List<ItemVentaRequest> items) { this.items = items; }
}
