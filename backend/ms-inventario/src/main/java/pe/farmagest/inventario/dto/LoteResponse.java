package pe.farmagest.inventario.dto;

import pe.farmagest.inventario.entity.EstadoLote;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class LoteResponse {
    private Long id;
    private Long productoId;
    private Integer sucursalId;
    private String numeroLote;
    private LocalDate fechaVencimiento;
    private Integer cantidadInicial;
    private Integer cantidadActual;
    private BigDecimal costoUnitario;
    private EstadoLote estado;
    private Long diasRestantes;
    private String semaforoVencimiento; // VERDE, AMARILLO, ROJO, VENCIDO

    public LoteResponse() {}

    public LoteResponse(Long id, Long productoId, Integer sucursalId, String numeroLote,
                        LocalDate fechaVencimiento, Integer cantidadInicial, Integer cantidadActual,
                        BigDecimal costoUnitario, EstadoLote estado) {
        this.id = id;
        this.productoId = productoId;
        this.sucursalId = sucursalId;
        this.numeroLote = numeroLote;
        this.fechaVencimiento = fechaVencimiento;
        this.cantidadInicial = cantidadInicial;
        this.cantidadActual = cantidadActual;
        this.costoUnitario = costoUnitario;
        this.estado = estado;

        if (fechaVencimiento != null) {
            this.diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), fechaVencimiento);
            if (this.diasRestantes <= 0) {
                this.semaforoVencimiento = "VENCIDO";
            } else if (this.diasRestantes <= 30) {
                this.semaforoVencimiento = "ROJO";
            } else if (this.diasRestantes <= 90) {
                this.semaforoVencimiento = "AMARILLO";
            } else {
                this.semaforoVencimiento = "VERDE";
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public Integer getCantidadInicial() { return cantidadInicial; }
    public void setCantidadInicial(Integer cantidadInicial) { this.cantidadInicial = cantidadInicial; }

    public Integer getCantidadActual() { return cantidadActual; }
    public void setCantidadActual(Integer cantidadActual) { this.cantidadActual = cantidadActual; }

    public BigDecimal getCostoUnitario() { return costoUnitario; }
    public void setCostoUnitario(BigDecimal costoUnitario) { this.costoUnitario = costoUnitario; }

    public EstadoLote getEstado() { return estado; }
    public void setEstado(EstadoLote estado) { this.estado = estado; }

    public Long getDiasRestantes() { return diasRestantes; }
    public void setDiasRestantes(Long diasRestantes) { this.diasRestantes = diasRestantes; }

    public String getSemaforoVencimiento() { return semaforoVencimiento; }
    public void setSemaforoVencimiento(String semaforoVencimiento) { this.semaforoVencimiento = semaforoVencimiento; }
}
