package pe.farmagest.ventas.dto;

import pe.farmagest.ventas.entity.EstadoSesionCaja;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SesionCajaDto {
    private Long id;
    private Integer cajaId;
    private String nombreCaja;
    private String codigoCaja;
    private Long usuarioId;
    private Integer sucursalId;
    private BigDecimal montoApertura;
    private BigDecimal montoCierreSistema;
    private BigDecimal montoCierreReal;
    private BigDecimal diferencia;
    private EstadoSesionCaja estado;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private String observaciones;

    // Resumen de ventas durante el turno
    private BigDecimal totalVentasEfectivo;
    private BigDecimal totalVentasTarjeta;
    private BigDecimal totalVentasBilletera;
    private BigDecimal totalVentasGeneral;
    private Integer cantidadTransacciones;

    public SesionCajaDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCajaId() { return cajaId; }
    public void setCajaId(Integer cajaId) { this.cajaId = cajaId; }

    public String getNombreCaja() { return nombreCaja; }
    public void setNombreCaja(String nombreCaja) { this.nombreCaja = nombreCaja; }

    public String getCodigoCaja() { return codigoCaja; }
    public void setCodigoCaja(String codigoCaja) { this.codigoCaja = codigoCaja; }

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

    public BigDecimal getTotalVentasEfectivo() { return totalVentasEfectivo; }
    public void setTotalVentasEfectivo(BigDecimal totalVentasEfectivo) { this.totalVentasEfectivo = totalVentasEfectivo; }

    public BigDecimal getTotalVentasTarjeta() { return totalVentasTarjeta; }
    public void setTotalVentasTarjeta(BigDecimal totalVentasTarjeta) { this.totalVentasTarjeta = totalVentasTarjeta; }

    public BigDecimal getTotalVentasBilletera() { return totalVentasBilletera; }
    public void setTotalVentasBilletera(BigDecimal totalVentasBilletera) { this.totalVentasBilletera = totalVentasBilletera; }

    public BigDecimal getTotalVentasGeneral() { return totalVentasGeneral; }
    public void setTotalVentasGeneral(BigDecimal totalVentasGeneral) { this.totalVentasGeneral = totalVentasGeneral; }

    public Integer getCantidadTransacciones() { return cantidadTransacciones; }
    public void setCantidadTransacciones(Integer cantidadTransacciones) { this.cantidadTransacciones = cantidadTransacciones; }
}
