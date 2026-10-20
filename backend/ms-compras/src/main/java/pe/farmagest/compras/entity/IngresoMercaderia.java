package pe.farmagest.compras.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ingreso_mercaderia")
public class IngresoMercaderia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_guia", nullable = false, length = 50)
    private String numeroGuia;

    @Column(name = "numero_factura_proveedor", length = 50)
    private String numeroFacturaProveedor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "orden_compra_id")
    private OrdenCompra ordenCompra;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "usuario_recepcion_id", nullable = false)
    private Long usuarioRecepcionId;

    @Column(name = "fecha_recepcion", nullable = false)
    private LocalDateTime fechaRecepcion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @OneToMany(mappedBy = "ingreso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleIngreso> detalles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.fechaRecepcion == null) {
            this.fechaRecepcion = LocalDateTime.now();
        }
    }

    public IngresoMercaderia() {}

    public void addDetalle(DetalleIngreso detalle) {
        detalles.add(detalle);
        detalle.setIngreso(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroGuia() { return numeroGuia; }
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }

    public String getNumeroFacturaProveedor() { return numeroFacturaProveedor; }
    public void setNumeroFacturaProveedor(String numeroFacturaProveedor) { this.numeroFacturaProveedor = numeroFacturaProveedor; }

    public OrdenCompra getOrdenCompra() { return ordenCompra; }
    public void setOrdenCompra(OrdenCompra ordenCompra) { this.ordenCompra = ordenCompra; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public Long getUsuarioRecepcionId() { return usuarioRecepcionId; }
    public void setUsuarioRecepcionId(Long usuarioRecepcionId) { this.usuarioRecepcionId = usuarioRecepcionId; }

    public LocalDateTime getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(LocalDateTime fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<DetalleIngreso> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleIngreso> detalles) { this.detalles = detalles; }
}
