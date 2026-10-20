package pe.farmagest.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.farmagest.ventas.entity.TipoDocumento;

public class CrearClienteRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipoDocumento = TipoDocumento.DNI;

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    @NotBlank(message = "Los nombres o razón social son obligatorios")
    private String nombresORazonSocial;

    private String direccion;
    private String telefono;
    private String email;

    public CrearClienteRequest() {}

    public TipoDocumento getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(TipoDocumento tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }

    public String getNombresORazonSocial() { return nombresORazonSocial; }
    public void setNombresORazonSocial(String nombresORazonSocial) { this.nombresORazonSocial = nombresORazonSocial; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
