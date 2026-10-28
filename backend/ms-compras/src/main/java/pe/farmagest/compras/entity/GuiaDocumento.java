package pe.farmagest.compras.entity;
import jakarta.persistence.*;
@Entity @Table(name="guia_documento")
public class GuiaDocumento {
 @Id @Column(name="ingreso_id") private Long ingresoId;
 @Column(nullable=false,length=180) private String nombre;
 @Column(nullable=false,length=40) private String tipo;
 @Lob @Column(nullable=false,columnDefinition="MEDIUMBLOB") private byte[] contenido;
 public Long getIngresoId(){return ingresoId;} public void setIngresoId(Long value){ingresoId=value;}
 public String getNombre(){return nombre;} public void setNombre(String value){nombre=value;}
 public String getTipo(){return tipo;} public void setTipo(String value){tipo=value;}
 public byte[] getContenido(){return contenido;} public void setContenido(byte[] value){contenido=value;}
}
