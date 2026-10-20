package pe.farmagest.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.farmagest.inventario.entity.TipoMovimiento;

public class AjusteStockRequest {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    @NotNull(message = "El ID del lote es obligatorio para el ajuste")
    private Long loteId;

    private Integer sucursalId = 1;

    @NotNull(message = "El tipo de ajuste es obligatorio (AJUSTE_MERMA, AJUSTE_SOBRANTE, AJUSTE_VENCIMIENTO)")
    private TipoMovimiento tipoAjuste;

    @NotNull(message = "La cantidad a ajustar es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    @NotBlank(message = "El motivo del ajuste es obligatorio para la auditoría")
    private String motivo;

    public AjusteStockRequest() {}

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }

    public Integer getSucursalId() { return sucursalId; }
    public void setSucursalId(Integer sucursalId) { this.sucursalId = sucursalId; }

    public TipoMovimiento getTipoAjuste() { return tipoAjuste; }
    public void setTipoAjuste(TipoMovimiento tipoAjuste) { this.tipoAjuste = tipoAjuste; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
