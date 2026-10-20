package pe.farmagest.ventas.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "venta_espera")
public class VentaEspera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "sucursal_id", nullable = false)
    private Integer sucursalId = 1;

    @Column(name = "codigo_espera", nullable = false, unique = true, length = 50)
    private String codigoEspera;

    @Column(name = "nombre_referencia", length = 100)
    private String nombreReferencia;

    @Column(name = "datos_json", nullable = false, columnDefinition = "TEXT")
    private String datosJson;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    public VentaEspera() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public String getCodigoEspera() { return codigoEspera; }
    public void setCodigoEspera(String codigoEspera) { this.codigoEspera = codigoEspera; }

    public String getNombreReferencia() { return nombreReferencia; }
    public void setNombreReferencia(String nombreReferencia) { this.nombreReferencia = nombreReferencia; }

    public String getDatosJson() { return datosJson; }
    public void setDatosJson(String datosJson) { this.datosJson = datosJson; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}
