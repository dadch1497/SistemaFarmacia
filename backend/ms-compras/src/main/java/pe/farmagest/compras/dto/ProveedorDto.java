package pe.farmagest.compras.dto;

import java.time.LocalDateTime;

public class ProveedorDto {
    private Integer id;
    private String ruc;
    private String razonSocial;
    private String nombreContacto;
    private String telefono;
    private String email;
    private String direccion;
    private Boolean activo;
    private LocalDateTime creadoEn;

    public ProveedorDto() {}

    public ProveedorDto(Integer id, String ruc, String razonSocial, String nombreContacto,
                        String telefono, String email, String direccion, Boolean activo, LocalDateTime creadoEn) {
        this.id = id;
        this.ruc = ruc;
        this.razonSocial = razonSocial;
        this.nombreContacto = nombreContacto;
        this.telefono = telefono;
        this.email = email;
        this.direccion = direccion;
        this.activo = activo;
        this.creadoEn = creadoEn;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRuc() { return ruc; }
    public void setRuc(String ruc) { this.ruc = ruc; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }

    public String getNombreContacto() { return nombreContacto; }
    public void setNombreContacto(String nombreContacto) { this.nombreContacto = nombreContacto; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}
