package pe.farmagest.compras.dto;

import pe.farmagest.compras.entity.EstadoOrden;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OrdenCompraDto {
    private Long id;
    private String numeroOrden;
    private ProveedorDto proveedor;
    private Integer sucursalId;
    private EstadoOrden estado;
    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal total;
    private Long usuarioCreadorId;
    private LocalDateTime fechaEmision;
    private LocalDate fechaEsperada;
    private String observaciones;
    private List<DetalleOrdenDto> detalles;

    public OrdenCompraDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }

    public ProveedorDto getProveedor() { return proveedor; }
    public void setProveedor(ProveedorDto proveedor) { this.proveedor = proveedor; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public EstadoOrden getEstado() { return estado; }
    public void setEstado(EstadoOrden estado) { this.estado = estado; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getIgv() { return igv; }
    public void setIgv(BigDecimal igv) { this.igv = igv; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public Long getUsuarioCreadorId() { return usuarioCreadorId; }
    public void setUsuarioCreadorId(Long usuarioCreadorId) { this.usuarioCreadorId = usuarioCreadorId; }

    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }

    public LocalDate getFechaEsperada() { return fechaEsperada; }
    public void setFechaEsperada(LocalDate fechaEsperada) { this.fechaEsperada = fechaEsperada; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<DetalleOrdenDto> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleOrdenDto> detalles) { this.detalles = detalles; }
}
