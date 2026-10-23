package pe.farmagest.ventas.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Evento emitido cuando una venta ha sido registrada y necesita ser procesada por el micro‑servicio
 * de integración con SUNAT.
 */
public class VentaRegistradaEvent {
    private Long ventaId;
    private String clienteNumeroDoc;
    private String clienteRazonSocial;
    private String tipoComprobante;
    private String serie;
    private String numero;
    private BigDecimal total;
    private LocalDateTime fechaEmision;

    public VentaRegistradaEvent() {
    }

    public VentaRegistradaEvent(Long ventaId, String clienteNumeroDoc, String clienteRazonSocial,
                               String tipoComprobante, String serie, String numero,
                               BigDecimal total, LocalDateTime fechaEmision) {
        this.ventaId = ventaId;
        this.clienteNumeroDoc = clienteNumeroDoc;
        this.clienteRazonSocial = clienteRazonSocial;
        this.tipoComprobante = tipoComprobante;
        this.serie = serie;
        this.numero = numero;
        this.total = total;
        this.fechaEmision = fechaEmision;
    }

    public Long getVentaId() {
        return ventaId;
    }

    public void setVentaId(Long ventaId) {
        this.ventaId = ventaId;
    }

    public String getClienteNumeroDoc() {
        return clienteNumeroDoc;
    }

    public void setClienteNumeroDoc(String clienteNumeroDoc) {
        this.clienteNumeroDoc = clienteNumeroDoc;
    }

    public String getClienteRazonSocial() {
        return clienteRazonSocial;
    }

    public void setClienteRazonSocial(String clienteRazonSocial) {
        this.clienteRazonSocial = clienteRazonSocial;
    }

    public String getTipoComprobante() {
        return tipoComprobante;
    }

    public void setTipoComprobante(String tipoComprobante) {
        this.tipoComprobante = tipoComprobante;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public LocalDateTime getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDateTime fechaEmision) {
        this.fechaEmision = fechaEmision;
    }
}
