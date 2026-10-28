package pe.farmagest.compras.service;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import pe.farmagest.compras.entity.GuiaDocumento;
import pe.farmagest.compras.repository.GuiaDocumentoRepository;
import pe.farmagest.compras.repository.IngresoMercaderiaRepository;
@Service
public class GuiaDocumentoService {
 private final GuiaDocumentoRepository repository;
 private final IngresoMercaderiaRepository ingresos;
 public GuiaDocumentoService(GuiaDocumentoRepository repository,IngresoMercaderiaRepository ingresos){this.repository=repository;this.ingresos=ingresos;}
 public GuiaDocumento validar(MultipartFile file){
  if(file==null || file.isEmpty() || file.getSize()>12L*1024*1024) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El documento debe tener contenido y pesar hasta 12 MB");
  byte[] bytes;
  try{bytes=file.getBytes();}catch(IOException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No se pudo leer el documento");}
  String tipo=null;
  if(bytes.length>=5 && new String(bytes,0,5,StandardCharsets.US_ASCII).equals("%PDF-")) tipo="application/pdf";
  else if(bytes.length>=8 && bytes[0]==(byte)0x89 && bytes[1]==0x50 && bytes[2]==0x4e && bytes[3]==0x47 && bytes[4]==0x0d && bytes[5]==0x0a && bytes[6]==0x1a && bytes[7]==0x0a) tipo="image/png";
  else if(bytes.length>=3 && bytes[0]==(byte)0xff && bytes[1]==(byte)0xd8 && bytes[2]==(byte)0xff) tipo="image/jpeg";
  else if(bytes.length>=12 && new String(bytes,0,4,StandardCharsets.US_ASCII).equals("RIFF") && new String(bytes,8,4,StandardCharsets.US_ASCII).equals("WEBP")) tipo="image/webp";
  if(tipo==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Adjunta un PDF, JPG, PNG o WebP válido");
  String nombre=file.getOriginalFilename()==null?"guia":file.getOriginalFilename();
  nombre=nombre.replace('\\','/'); nombre=nombre.substring(nombre.lastIndexOf('/')+1).replaceAll("[\\p{Cntrl}\\\"<>]","_");
  if(nombre.isBlank()) nombre="guia";
  if(nombre.length()>180) nombre=nombre.substring(nombre.length()-180);
  GuiaDocumento guia=new GuiaDocumento();guia.setNombre(nombre);guia.setTipo(tipo);guia.setContenido(bytes);return guia;
 }
 public void guardar(Long ingresoId,GuiaDocumento guia){guia.setIngresoId(ingresoId);repository.saveAndFlush(guia);}
 public boolean tiene(Long ingresoId){return repository.existsById(ingresoId);}
 @Transactional(readOnly=true)
 public GuiaDocumento obtener(Long ingresoId){return repository.findById(ingresoId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Esta recepción no tiene guía adjunta"));}
 @Transactional
 public void adjuntar(Long ingresoId,MultipartFile file){
  if(!ingresos.existsById(ingresoId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Recepción no encontrada");
  if(repository.existsById(ingresoId)) throw new ResponseStatusException(HttpStatus.CONFLICT,"La recepción ya tiene una guía adjunta");
  guardar(ingresoId,validar(file));
 }
}
