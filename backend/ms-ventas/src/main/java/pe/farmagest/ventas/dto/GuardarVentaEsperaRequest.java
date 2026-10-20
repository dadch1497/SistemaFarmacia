package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotBlank;

public class GuardarVentaEsperaRequest {

    private String nombreReferencia;

    @NotBlank(message = "Los datos del carrito no pueden estar vacíos")
    private String datosJson;

    public GuardarVentaEsperaRequest() {}

    public String getNombreReferencia() { return nombreReferencia; }
    public void setNombreReferencia(String nombreReferencia) { this.nombreReferencia = nombreReferencia; }

    public String getDatosJson() { return datosJson; }
    public void setDatosJson(String datosJson) { this.datosJson = datosJson; }
}
