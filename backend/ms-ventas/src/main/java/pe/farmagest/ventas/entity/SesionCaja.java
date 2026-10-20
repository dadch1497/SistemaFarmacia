package pe.farmagest.ventas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesion_caja")
public class SesionCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caja_id", nullable = false)
    private Caja caja;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "monto_apertura", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoApertura;

    @Column(name = "monto_cierre_sistema", precision = 10, scale = 2)
    private BigDecimal montoCierreSistema;

    @Column(name = "monto_cierre_real", precision = 10, scale = 2)
    private BigDecimal montoCierreReal;

    @Column(name = "diferencia", precision = 10, scale = 2)
    private BigDecimal diferencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSesionCaja estado = EstadoSesionCaja.ABIERTA;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    public SesionCaja() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Caja getCaja() { return caja; }
    public void setCaja(Caja caja) { this.caja = caja; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public BigDecimal getMontoApertura() { return montoApertura; }
    public void setMontoApertura(BigDecimal montoApertura) { this.montoApertura = montoApertura; }

    public BigDecimal getMontoCierreSistema() { return montoCierreSistema; }
    public void setMontoCierreSistema(BigDecimal montoCierreSistema) { this.montoCierreSistema = montoCierreSistema; }

    public BigDecimal getMontoCierreReal() { return montoCierreReal; }
    public void setMontoCierreReal(BigDecimal montoCierreReal) { this.montoCierreReal = montoCierreReal; }

    public BigDecimal getDiferencia() { return diferencia; }
    public void setDiferencia(BigDecimal diferencia) { this.diferencia = diferencia; }

    public EstadoSesionCaja getEstado() { return estado; }
    public void setEstado(EstadoSesionCaja estado) { this.estado = estado; }

    public LocalDateTime getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(LocalDateTime fechaApertura) { this.fechaApertura = fechaApertura; }

    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
