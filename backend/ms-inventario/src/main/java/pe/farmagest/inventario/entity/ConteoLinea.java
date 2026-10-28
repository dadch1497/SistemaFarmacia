package pe.farmagest.inventario.entity;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Entity @Table(name="conteo_linea",uniqueConstraints=@UniqueConstraint(columnNames={"conteo_id","producto_id"}))
public class ConteoLinea {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Long conteoId; public Long productoId;
 @Column(length=150) public String nombre;
 @Column(length=128) public String codigo;
 @Column(length=150) public String presentacion;
 public Integer stockInicial; public LocalDateTime actualizadoInicial;
 public Integer cantidad; public Long usuarioId; public LocalDateTime contadoEn;
 @Column(length=500) public String observacion;
 @Column(length=40) public String resultado;
}
