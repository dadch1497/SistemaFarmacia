package pe.farmagest.catalogo.entity;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "laboratorio")
public class Laboratorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "pais_origen", length = 80)
    private String paisOrigen;

    @Column(nullable = false)
    private Boolean activo = true;

    public Laboratorio() {
    }

    public Laboratorio(Integer id, String nombre, String paisOrigen, Boolean activo) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Laboratorio that = (Laboratorio) o;
        return Objects.equals(id, that.id) || Objects.equals(nombre, that.nombre);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nombre);
    }
}
