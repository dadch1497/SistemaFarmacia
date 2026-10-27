package pe.farmagest.ventas.dto;

import pe.farmagest.ventas.entity.MedioPago;
import pe.farmagest.ventas.entity.TipoComprobante;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class NotaCreditoDto {

    private Long id;
    private Integer sucursalId;
    private Long sesionCajaId;
    private Long ventaId;
    private TipoComprobante tipoComprobanteModificado;
    private String serieComprobanteModificado;
    private String numeroComprobanteModificado;
    private String serieNotaCredito;
    private String numeroNotaCredito;
    private String tipoNotaCredito;
    private String descripcionTipoNotaCredito;
    private String motivoSustento;
    private ClienteDto cliente;
    private LocalDateTime fechaHora;
    private BigDecimal subtotalDevuelto;
    private BigDecimal igvDevuelto;
    private BigDecimal totalDevuelto;
    private MedioPago medioReembolso;
    private Boolean reingresoStockRealizado;
    private String hashCpe;
    private String qrCodeUrl;
    private String estadoSunat;
    private List<DetalleNotaCreditoDto> detalles;

    public NotaCreditoDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Long getSesionCajaId() { return sesionCajaId; }
    public void setSesionCajaId(Long sesionCajaId) { this.sesionCajaId = sesionCajaId; }

    public Long getVentaId() { return ventaId; }
    public void setVentaId(Long ventaId) { this.ventaId = ventaId; }

    public TipoComprobante getTipoComprobanteModificado() { return tipoComprobanteModificado; }
    public void setTipoComprobanteModificado(TipoComprobante tipoComprobanteModificado) { this.tipoComprobanteModificado = tipoComprobanteModificado; }

    public String getSerieComprobanteModificado() { return serieComprobanteModificado; }
    public void setSerieComprobanteModificado(String serieComprobanteModificado) { this.serieComprobanteModificado = serieComprobanteModificado; }

    public String getNumeroComprobanteModificado() { return numeroComprobanteModificado; }
    public void setNumeroComprobanteModificado(String numeroComprobanteModificado) { this.numeroComprobanteModificado = numeroComprobanteModificado; }

    public String getSerieNotaCredito() { return serieNotaCredito; }
    public void setSerieNotaCredito(String serieNotaCredito) { this.serieNotaCredito = serieNotaCredito; }

    public String getNumeroNotaCredito() { return numeroNotaCredito; }
    public void setNumeroNotaCredito(String numeroNotaCredito) { this.numeroNotaCredito = numeroNotaCredito; }

    public String getTipoNotaCredito() { return tipoNotaCredito; }
    public void setTipoNotaCredito(String tipoNotaCredito) { this.tipoNotaCredito = tipoNotaCredito; }

    public String getDescripcionTipoNotaCredito() { return descripcionTipoNotaCredito; }
    public void setDescripcionTipoNotaCredito(String descripcionTipoNotaCredito) { this.descripcionTipoNotaCredito = descripcionTipoNotaCredito; }

    public String getMotivoSustento() { return motivoSustento; }
    public void setMotivoSustento(String motivoSustento) { this.motivoSustento = motivoSustento; }

    public ClienteDto getCliente() { return cliente; }
    public void setCliente(ClienteDto cliente) { this.cliente = cliente; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public BigDecimal getSubtotalDevuelto() { return subtotalDevuelto; }
    public void setSubtotalDevuelto(BigDecimal subtotalDevuelto) { this.subtotalDevuelto = subtotalDevuelto; }

    public BigDecimal getIgvDevuelto() { return igvDevuelto; }
    public void setIgvDevuelto(BigDecimal igvDevuelto) { this.igvDevuelto = igvDevuelto; }

    public BigDecimal getTotalDevuelto() { return totalDevuelto; }
    public void setTotalDevuelto(BigDecimal totalDevuelto) { this.totalDevuelto = totalDevuelto; }

    public MedioPago getMedioReembolso() { return medioReembolso; }
    public void setMedioReembolso(MedioPago medioReembolso) { this.medioReembolso = medioReembolso; }

    public Boolean getReingresoStockRealizado() { return reingresoStockRealizado; }
    public void setReingresoStockRealizado(Boolean reingresoStockRealizado) { this.reingresoStockRealizado = reingresoStockRealizado; }

    public String getHashCpe() { return hashCpe; }
    public void setHashCpe(String hashCpe) { this.hashCpe = hashCpe; }

    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }

    public String getEstadoSunat() { return estadoSunat; }
    public void setEstadoSunat(String estadoSunat) { this.estadoSunat = estadoSunat; }

    public List<DetalleNotaCreditoDto> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleNotaCreditoDto> detalles) { this.detalles = detalles; }
}
