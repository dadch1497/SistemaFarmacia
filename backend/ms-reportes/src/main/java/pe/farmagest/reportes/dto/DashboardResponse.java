package pe.farmagest.reportes.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {
    private String periodo;
    private KpisDto kpis;
    private List<ProductoRankingDto> productosMasVendidos;
    private List<MedioPagoResumenDto> ventasPorMedioPago;
    private List<VendedorResumenDto> ventasPorVendedor;

    public DashboardResponse() {}

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public KpisDto getKpis() { return kpis; }
    public void setKpis(KpisDto kpis) { this.kpis = kpis; }

    public List<ProductoRankingDto> getProductosMasVendidos() { return productosMasVendidos; }
    public void setProductosMasVendidos(List<ProductoRankingDto> productosMasVendidos) { this.productosMasVendidos = productosMasVendidos; }

    public List<MedioPagoResumenDto> getVentasPorMedioPago() { return ventasPorMedioPago; }
    public void setVentasPorMedioPago(List<MedioPagoResumenDto> ventasPorMedioPago) { this.ventasPorMedioPago = ventasPorMedioPago; }

    public List<VendedorResumenDto> getVentasPorVendedor() { return ventasPorVendedor; }
    public void setVentasPorVendedor(List<VendedorResumenDto> ventasPorVendedor) { this.ventasPorVendedor = ventasPorVendedor; }

    public static class KpisDto {
        private VentasKpi ventasHoy;
        private VentasKpi ventasMes;
        private VentasKpi ventasAnio;
        private UtilidadKpi utilidadMes;
        private TicketPromedioKpi ticketPromedio;

        public KpisDto() {}

        public VentasKpi getVentasHoy() { return ventasHoy; }
        public void setVentasHoy(VentasKpi ventasHoy) { this.ventasHoy = ventasHoy; }

        public VentasKpi getVentasMes() { return ventasMes; }
        public void setVentasMes(VentasKpi ventasMes) { this.ventasMes = ventasMes; }

        public VentasKpi getVentasAnio() { return ventasAnio; }
        public void setVentasAnio(VentasKpi ventasAnio) { this.ventasAnio = ventasAnio; }

        public UtilidadKpi getUtilidadMes() { return utilidadMes; }
        public void setUtilidadMes(UtilidadKpi utilidadMes) { this.utilidadMes = utilidadMes; }

        public TicketPromedioKpi getTicketPromedio() { return ticketPromedio; }
        public void setTicketPromedio(TicketPromedioKpi ticketPromedio) { this.ticketPromedio = ticketPromedio; }
    }

    public static class VentasKpi {
        private BigDecimal monto;
        private Double variacionPorcentual;

        public VentasKpi() {}
        public VentasKpi(BigDecimal monto, Double variacionPorcentual) {
            this.monto = monto;
            this.variacionPorcentual = variacionPorcentual;
        }

        public BigDecimal getMonto() { return monto; }
        public void setMonto(BigDecimal monto) { this.monto = monto; }

        public Double getVariacionPorcentual() { return variacionPorcentual; }
        public void setVariacionPorcentual(Double variacionPorcentual) { this.variacionPorcentual = variacionPorcentual; }
    }

    public static class UtilidadKpi {
        private BigDecimal monto;
        private Double margenPorcentual;

        public UtilidadKpi() {}
        public UtilidadKpi(BigDecimal monto, Double margenPorcentual) {
            this.monto = monto;
            this.margenPorcentual = margenPorcentual;
        }

        public BigDecimal getMonto() { return monto; }
        public void setMonto(BigDecimal monto) { this.monto = monto; }

        public Double getMargenPorcentual() { return margenPorcentual; }
        public void setMargenPorcentual(Double margenPorcentual) { this.margenPorcentual = margenPorcentual; }
    }

    public static class TicketPromedioKpi {
        private BigDecimal monto;
        private Integer totalTransaccionesDia;

        public TicketPromedioKpi() {}
        public TicketPromedioKpi(BigDecimal monto, Integer totalTransaccionesDia) {
            this.monto = monto;
            this.totalTransaccionesDia = totalTransaccionesDia;
        }

        public BigDecimal getMonto() { return monto; }
        public void setMonto(BigDecimal monto) { this.monto = monto; }

        public Integer getTotalTransaccionesDia() { return totalTransaccionesDia; }
        public void setTotalTransaccionesDia(Integer totalTransaccionesDia) { this.totalTransaccionesDia = totalTransaccionesDia; }
    }

    public static class ProductoRankingDto {
        private int rank;
        private Long productoId;
        private String producto;
        private Integer unidades;
        private BigDecimal monto;

        public ProductoRankingDto() {}
        public ProductoRankingDto(int rank, Long productoId, String producto, Integer unidades, BigDecimal monto) {
            this.rank = rank;
            this.productoId = productoId;
            this.producto = producto;
            this.unidades = unidades;
            this.monto = monto;
        }

        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }

        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }

        public String getProducto() { return producto; }
        public void setProducto(String producto) { this.producto = producto; }

        public Integer getUnidades() { return unidades; }
        public void setUnidades(Integer unidades) { this.unidades = unidades; }

        public BigDecimal getMonto() { return monto; }
        public void setMonto(BigDecimal monto) { this.monto = monto; }
    }

    public static class MedioPagoResumenDto {
        private String medioPago;
        private Double porcentaje;
        private BigDecimal total;

        public MedioPagoResumenDto() {}
        public MedioPagoResumenDto(String medioPago, Double porcentaje, BigDecimal total) {
            this.medioPago = medioPago;
            this.porcentaje = porcentaje;
            this.total = total;
        }

        public String getMedioPago() { return medioPago; }
        public void setMedioPago(String medioPago) { this.medioPago = medioPago; }

        public Double getPorcentaje() { return porcentaje; }
        public void setPorcentaje(Double porcentaje) { this.porcentaje = porcentaje; }

        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
    }

    public static class VendedorResumenDto {
        private Long usuarioId;
        private String vendedor;
        private BigDecimal monto;
        private Integer totalVentas;

        public VendedorResumenDto() {}
        public VendedorResumenDto(Long usuarioId, String vendedor, BigDecimal monto, Integer totalVentas) {
            this.usuarioId = usuarioId;
            this.vendedor = vendedor;
            this.monto = monto;
            this.totalVentas = totalVentas;
        }

        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

        public String getVendedor() { return vendedor; }
        public void setVendedor(String vendedor) { this.vendedor = vendedor; }

        public BigDecimal getMonto() { return monto; }
        public void setMonto(BigDecimal monto) { this.monto = monto; }

        public Integer getTotalVentas() { return totalVentas; }
        public void setTotalVentas(Integer totalVentas) { this.totalVentas = totalVentas; }
    }
}
