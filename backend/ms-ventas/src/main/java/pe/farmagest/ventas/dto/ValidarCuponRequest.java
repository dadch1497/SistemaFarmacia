package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public class ValidarCuponRequest {

    @NotBlank(message = "El código del cupón es obligatorio")
    private String codigo;

    @NotNull(message = "El monto actual de la venta es obligatorio")
    @PositiveOrZero(message = "El monto no puede ser negativo")
    private BigDecimal montoVenta;

    private List<Long> productosIds;

    public ValidarCuponRequest() {}

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public BigDecimal getMontoVenta() { return montoVenta; }
    public void setMontoVenta(BigDecimal montoVenta) { this.montoVenta = montoVenta; }

    public List<Long> getProductosIds() { return productosIds; }
    public void setProductosIds(List<Long> productosIds) { this.productosIds = productosIds; }
}
