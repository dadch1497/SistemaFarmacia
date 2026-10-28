package pe.farmagest.inventario.dto;
import java.time.Instant;import java.util.List;
public record ConteoDto(Long id,Integer sucursalId,String referencia,Long usuarioId,Instant creadoEn,Instant cerradoEn,String estado,boolean tieneFoto,String revision,Long revisadoPor,Instant revisadoEn,List<Linea> lineas,List<Evento> eventos){
 public record Linea(Long productoId,String nombre,String codigo,String presentacion,Integer cantidad,Long usuarioId,Instant contadoEn,String observacion,Integer esperado,Long diferencia,String resultado){}
 public record Evento(Long usuarioId,Instant fecha,String accion,String detalle){}
}
