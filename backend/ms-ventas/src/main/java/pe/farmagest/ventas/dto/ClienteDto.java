package pe.farmagest.ventas.dto;

import pe.farmagest.ventas.entity.TipoDocumento;

public class ClienteDto {
    private Long id;
    private TipoDocumento tipoDocumento;
    private String numeroDocumento;
    private String nombresORazonSocial;
    private String direccion;
    private String telefono;
    private String email;
    private Boolean activo;

    public ClienteDto() {}

    public ClienteDto(Long id, TipoDocumento tipoDocumento, String numeroDocumento, String nombresORazonSocial,
                      String direccion, String telefono, String email, Boolean activo) {
        this.id = id;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
        this.nombresORazonSocial = nombresORazonSocial;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
        this.activo = activo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
