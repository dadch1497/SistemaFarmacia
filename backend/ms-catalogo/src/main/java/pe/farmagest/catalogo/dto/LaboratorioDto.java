package pe.farmagest.catalogo.dto;

public class LaboratorioDto {

    private Integer id;
    private String nombre;
    private String paisOrigen;
    private Boolean activo;

    public LaboratorioDto() {
    }

    public LaboratorioDto(Integer id, String nombre, String paisOrigen, Boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.paisOrigen = paisOrigen;
        this.activo = activo;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getPaisOrigen() {
        return paisOrigen;
    }

    public void setPaisOrigen(String paisOrigen) {
        this.paisOrigen = paisOrigen;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
