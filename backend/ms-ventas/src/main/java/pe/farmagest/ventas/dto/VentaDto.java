package pe.farmagest.ventas.dto;

import pe.farmagest.ventas.entity.EstadoVenta;
import pe.farmagest.ventas.entity.MedioPago;
import pe.farmagest.ventas.entity.TipoComprobante;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class VentaDto {
    private Long id;
    private Integer sucursalId;
    private Long sesionCajaId;
    private ClienteDto cliente;
    private Long usuarioVendedorId;
    private String nombreVendedor;
    private TipoComprobante tipoComprobante;
    private String serieComprobante;
    private String numeroComprobante;
    private BigDecimal subtotal;
    private BigDecimal montoDescuento;
    private BigDecimal igv;
    private BigDecimal total;
    private MedioPago medioPago;
    private BigDecimal montoRecibido;
    private BigDecimal vuelto;
    private Long promocionId;
    private String promocionNombre;
    private Long cuponId;
    private String cuponCodigo;
    private EstadoVenta estado;
    private LocalDateTime fechaHora;
    private String observaciones;
    private List<DetalleVentaDto> detalles;

    public VentaDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Long getSesionCajaId() { return sesionCajaId; }
    public void setSesionCajaId(Long sesionCajaId) { this.sesionCajaId = sesionCajaId; }

    public ClienteDto getCliente() { return cliente; }
    public void setCliente(ClienteDto cliente) { this.cliente = cliente; }

    public Long getUsuarioVendedorId() { return usuarioVendedorId; }
    public void setUsuarioVendedorId(Long usuarioVendedorId) { this.usuarioVendedorId = usuarioVendedorId; }

    public String getNombreVendedor() { return nombreVendedor; }
    public void setNombreVendedor(String nombreVendedor) { this.nombreVendedor = nombreVendedor; }

    public TipoComprobante getTipoComprobante() { return tipoComprobante; }
    public void setTipoComprobante(TipoComprobante tipoComprobante) { this.tipoComprobante = tipoComprobante; }

    public String getSerieComprobante() { return serieComprobante; }
    public void setSerieComprobante(String serieComprobante) { this.serieComprobante = serieComprobante; }

    public String getNumeroComprobante() { return numeroComprobante; }
    public void setNumeroComprobante(String numeroComprobante) { this.numeroComprobante = numeroComprobante; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getMontoDescuento() { return montoDescuento; }
    public void setMontoDescuento(BigDecimal montoDescuento) { this.montoDescuento = montoDescuento; }

    public BigDecimal getIgv() { return igv; }
    public void setIgv(BigDecimal igv) { this.igv = igv; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public MedioPago getMedioPago() { return medioPago; }
    public void setMedioPago(MedioPago medioPago) { this.medioPago = medioPago; }

    public BigDecimal getMontoRecibido() { return montoRecibido; }
    public void setMontoRecibido(BigDecimal montoRecibido) { this.montoRecibido = montoRecibido; }

    public BigDecimal getVuelto() { return vuelto; }
    public void setVuelto(BigDecimal vuelto) { this.vuelto = vuelto; }

    public Long getPromocionId() { return promocionId; }
    public void setPromocionId(Long promocionId) { this.promocionId = promocionId; }

    public String getPromocionNombre() { return promocionNombre; }
    public void setPromocionNombre(String promocionNombre) { this.promocionNombre = promocionNombre; }

    public Long getCuponId() { return cuponId; }
    public void setCuponId(Long cuponId) { this.cuponId = cuponId; }

    public String getCuponCodigo() { return cuponCodigo; }
    public void setCuponCodigo(String cuponCodigo) { this.cuponCodigo = cuponCodigo; }

    public EstadoVenta getEstado() { return estado; }
    public void setEstado(EstadoVenta estado) { this.estado = estado; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<DetalleVentaDto> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleVentaDto> detalles) { this.detalles = detalles; }
}
