package pe.farmagest.inventario.entity;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Entity @Table(name="conteo_evento")
public class ConteoEvento {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Long conteoId; public Long usuarioId; public LocalDateTime fecha;
 @Column(length=30) public String accion;
 @Column(length=1000) public String detalle;
}
