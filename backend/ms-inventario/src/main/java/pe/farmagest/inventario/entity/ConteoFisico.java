package pe.farmagest.inventario.entity;
import jakarta.persistence.*;import java.time.LocalDateTime;
@Entity @Table(name="conteo_fisico")
public class ConteoFisico {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Integer sucursalId;
 @Column(length=100) public String referencia;
 public Long usuarioId; public LocalDateTime creadoEn; public LocalDateTime cerradoEn;
 @Column(length=20) public String estado;
 public Long marcador; public Long revisadoPor;
 @Column(length=1000) public String revision;
 public LocalDateTime revisadoEn; public boolean tieneFoto;
}
