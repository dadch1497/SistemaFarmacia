package pe.farmagest.compras.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_orden_compra")
public class DetalleOrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_compra_id", nullable = false)
    @JsonIgnore
    private OrdenCompra ordenCompra;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "cantidad_solicitada", nullable = false)
    private Integer cantidadSolicitada;

    @Column(name = "costo_pactado", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoPactado;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public DetalleOrdenCompra() {}

    public DetalleOrdenCompra(Long productoId, Integer cantidadSolicitada, BigDecimal costoPactado) {
        this.productoId = productoId;
        this.cantidadSolicitada = cantidadSolicitada;
        this.costoPactado = costoPactado;
        this.subtotal = costoPactado.multiply(new BigDecimal(cantidadSolicitada));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public OrdenCompra getOrdenCompra() { return ordenCompra; }
    public void setOrdenCompra(OrdenCompra ordenCompra) { this.ordenCompra = ordenCompra; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getCantidadSolicitada() { return cantidadSolicitada; }
    public void setCantidadSolicitada(Integer cantidadSolicitada) { this.cantidadSolicitada = cantidadSolicitada; }

    public BigDecimal getCostoPactado() { return costoPactado; }
    public void setCostoPactado(BigDecimal costoPactado) { this.costoPactado = costoPactado; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
