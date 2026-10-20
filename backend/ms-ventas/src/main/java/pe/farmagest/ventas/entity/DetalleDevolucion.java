package pe.farmagest.ventas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_devolucion")
public class DetalleDevolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devolucion_id", nullable = false)
    private Devolucion devolucion;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "lote_id")
    private Long loteId;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "monto_reembolsado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoReembolsado;

    public DetalleDevolucion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Devolucion getDevolucion() { return devolucion; }
    public void setDevolucion(Devolucion devolucion) { this.devolucion = devolucion; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getMontoReembolsado() { return montoReembolsado; }
    public void setMontoReembolsado(BigDecimal montoReembolsado) { this.montoReembolsado = montoReembolsado; }
}
