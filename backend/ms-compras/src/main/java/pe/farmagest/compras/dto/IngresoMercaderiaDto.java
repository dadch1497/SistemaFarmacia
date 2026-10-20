package pe.farmagest.compras.dto;

import java.time.LocalDateTime;
import java.util.List;

public class IngresoMercaderiaDto {
    private Long id;
    private String numeroGuia;
    private String numeroFacturaProveedor;
    private Long ordenCompraId;
    private String numeroOrdenCompra;
    private Integer sucursalId;
    private Long usuarioRecepcionId;
    private LocalDateTime fechaRecepcion;
    private String observaciones;
    private List<DetalleIngresoDto> detalles;

    public IngresoMercaderiaDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroGuia() { return numeroGuia; }
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }

    public String getNumeroFacturaProveedor() { return numeroFacturaProveedor; }
    public void setNumeroFacturaProveedor(String numeroFacturaProveedor) { this.numeroFacturaProveedor = numeroFacturaProveedor; }

    public Long getOrdenCompraId() { return ordenCompraId; }
    public void setOrdenCompraId(Long ordenCompraId) { this.ordenCompraId = ordenCompraId; }

    public String getNumeroOrdenCompra() { return numeroOrdenCompra; }
    public void setNumeroOrdenCompra(String numeroOrdenCompra) { this.numeroOrdenCompra = numeroOrdenCompra; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Long getUsuarioRecepcionId() { return usuarioRecepcionId; }
    public void setUsuarioRecepcionId(Long usuarioRecepcionId) { this.usuarioRecepcionId = usuarioRecepcionId; }

    public LocalDateTime getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(LocalDateTime fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<DetalleIngresoDto> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleIngresoDto> detalles) { this.detalles = detalles; }
}
