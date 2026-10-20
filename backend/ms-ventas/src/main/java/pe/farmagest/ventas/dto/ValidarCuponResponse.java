package pe.farmagest.ventas.dto;

import java.math.BigDecimal;

public class ValidarCuponResponse {
    private boolean valido;
    private Long cuponId;
    private String codigo;
    private String mensaje;
    private BigDecimal porcentajeDescuento;
    private BigDecimal montoDescuentoCalculado;
    private BigDecimal nuevoTotal;

    public ValidarCuponResponse() {}

    public static ValidarCuponResponse invalido(String mensaje) {
        ValidarCuponResponse r = new ValidarCuponResponse();
        r.setValido(false);
        r.setMensaje(mensaje);
        r.setMontoDescuentoCalculado(BigDecimal.ZERO);
        return r;
    }

    public boolean isValido() { return valido; }
    public void setValido(boolean valido) { this.valido = valido; }

    public Long getCuponId() { return cuponId; }
    public void setCuponId(Long cuponId) { this.cuponId = cuponId; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public BigDecimal getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(BigDecimal porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    public BigDecimal getMontoDescuentoCalculado() { return montoDescuentoCalculado; }
    public void setMontoDescuentoCalculado(BigDecimal montoDescuentoCalculado) { this.montoDescuentoCalculado = montoDescuentoCalculado; }

    public BigDecimal getNuevoTotal() { return nuevoTotal; }
    public void setNuevoTotal(BigDecimal nuevoTotal) { this.nuevoTotal = nuevoTotal; }
}
