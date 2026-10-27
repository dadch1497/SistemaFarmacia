package pe.farmagest.ventas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "devolucion")
public class Devolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(nullable = false)
    private String motivo;

    @Column(name = "serie_nota_credito", length = 10)
    private String serieNotaCredito;

    @Column(name = "numero_nota_credito", length = 20)
    private String numeroNotaCredito;

    @Column(name = "tipo_nota_credito", length = 10)
    private String tipoNotaCredito = "07";

    @Column(name = "descripcion_tipo_nc", length = 100)
    private String descripcionTipoNc = "Devolución por ítem";

    @Column(name = "subtotal_devuelto", precision = 10, scale = 2)
    private BigDecimal subtotalDevuelto;

    @Column(name = "igv_devuelto", precision = 10, scale = 2)
    private BigDecimal igvDevuelto;

    @Column(name = "total_devuelto", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDevuelto;

    @Enumerated(EnumType.STRING)
    @Column(name = "medio_reembolso", length = 30)
    private MedioPago medioReembolso;

    @Column(name = "hash_cpe", length = 100)
    private String hashCpe;

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @Column(name = "estado_sunat", length = 30)
    private String estadoSunat = "ACEPTADA";

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @OneToMany(mappedBy = "devolucion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleDevolucion> detalles = new ArrayList<>();

    public Devolucion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Venta getVenta() { return venta; }
    public void setVenta(Venta venta) { this.venta = venta; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getSerieNotaCredito() { return serieNotaCredito; }
    public void setSerieNotaCredito(String serieNotaCredito) { this.serieNotaCredito = serieNotaCredito; }

    public String getNumeroNotaCredito() { return numeroNotaCredito; }
    public void setNumeroNotaCredito(String numeroNotaCredito) { this.numeroNotaCredito = numeroNotaCredito; }

    public String getTipoNotaCredito() { return tipoNotaCredito; }
    public void setTipoNotaCredito(String tipoNotaCredito) { this.tipoNotaCredito = tipoNotaCredito; }

    public String getDescripcionTipoNc() { return descripcionTipoNc; }
    public void setDescripcionTipoNc(String descripcionTipoNc) { this.descripcionTipoNc = descripcionTipoNc; }

    public BigDecimal getSubtotalDevuelto() { return subtotalDevuelto; }
    public void setSubtotalDevuelto(BigDecimal subtotalDevuelto) { this.subtotalDevuelto = subtotalDevuelto; }

    public BigDecimal getIgvDevuelto() { return igvDevuelto; }
    public void setIgvDevuelto(BigDecimal igvDevuelto) { this.igvDevuelto = igvDevuelto; }

    public BigDecimal getTotalDevuelto() { return totalDevuelto; }
    public void setTotalDevuelto(BigDecimal totalDevuelto) { this.totalDevuelto = totalDevuelto; }

    public MedioPago getMedioReembolso() { return medioReembolso; }
    public void setMedioReembolso(MedioPago medioReembolso) { this.medioReembolso = medioReembolso; }

    public String getHashCpe() { return hashCpe; }
    public void setHashCpe(String hashCpe) { this.hashCpe = hashCpe; }

    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }

    public String getEstadoSunat() { return estadoSunat; }
    public void setEstadoSunat(String estadoSunat) { this.estadoSunat = estadoSunat; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public List<DetalleDevolucion> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleDevolucion> detalles) { this.detalles = detalles; }

    public void agregarDetalle(DetalleDevolucion detalle) {
        detalles.add(detalle);
        detalle.setDevolucion(this);
    }
}
