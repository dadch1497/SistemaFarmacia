package pe.farmagest.inventario.entity;
import jakarta.persistence.*;
@Entity @Table(name="conteo_foto")
public class ConteoFoto { @Id public Long id; @Lob @Column(columnDefinition="LONGBLOB") public byte[] contenido; @Column(length=30) public String tipo; }
