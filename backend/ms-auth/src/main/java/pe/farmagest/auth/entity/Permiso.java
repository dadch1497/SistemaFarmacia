package pe.farmagest.auth.entity;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "permiso")
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 60)
    private String codigo;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String modulo;

    public Permiso() {
    }

    public Permiso(Integer id, String codigo, String descripcion, String modulo) {
        this.id = id;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.modulo = modulo;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Permiso permiso = (Permiso) o;
        return Objects.equals(id, permiso.id) || Objects.equals(codigo, permiso.codigo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(codigo);
    }
}
