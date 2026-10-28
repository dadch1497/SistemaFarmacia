package pe.farmagest.inventario.service;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import pe.farmagest.inventario.dto.ReporteInventarioResponse;
import pe.farmagest.inventario.dto.ReporteInventarioResponse.*;
import pe.farmagest.inventario.entity.*;
import pe.farmagest.inventario.repository.*;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
@Service
public class ReporteInventarioService {
 private final MovimientoKardexRepository kardex;private final LoteRepository lotes;private final ProductoStockRepository stocks;
 public ReporteInventarioService(MovimientoKardexRepository kardex,LoteRepository lotes,ProductoStockRepository stocks){this.kardex=kardex;this.lotes=lotes;this.stocks=stocks;}
 @Transactional(readOnly=true)
 public ReporteInventarioResponse consultar(Integer sucursal,LocalDate desde,LocalDate hasta,Long producto){
  if(sucursal==null||sucursal<1||desde==null||hasta==null||hasta.isBefore(desde)||ChronoUnit.DAYS.between(desde,hasta)>365||producto!=null&&producto<1)
   throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecciona fechas válidas (máximo 366 días) y una sucursal válida");
  ZoneId zona=ZoneId.of("America/Lima");
  LocalDateTime inicio=LocalDateTime.ofInstant(desde.atStartOfDay(zona).toInstant(),ZoneOffset.UTC);
  LocalDateTime fin=LocalDateTime.ofInstant(hasta.plusDays(1).atStartOfDay(zona).toInstant(),ZoneOffset.UTC);
  List<MovimientoKardex> registros=kardex.reporte(sucursal,producto,inicio,fin,PageRequest.of(0,10001));
  if(registros.size()>10000)throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,"Hay más de 10.000 movimientos. Reduce el período o selecciona un producto para exportar un reporte completo.");
  List<Lote> saldos=lotes.findBySucursalIdAndCantidadActualGreaterThan(sucursal,0).stream().filter(l->producto==null||producto.equals(l.getProductoId())).toList();
  List<ProductoStock> consolidados=stocks.findBySucursalId(sucursal).stream().filter(s->producto==null||producto.equals(s.getProductoId())).toList();
  return construir(sucursal,desde,hasta,registros,saldos,consolidados,Instant.now());
 }
 public ReporteInventarioResponse construir(Integer sucursal,LocalDate desde,LocalDate hasta,List<MovimientoKardex> registros,List<Lote> saldos,List<ProductoStock> consolidados,Instant corte){
  long entradas=0,salidas=0,ajustes=0,mermas=0,sinCostoMerma=0;
  BigDecimal costoMerma=BigDecimal.ZERO;List<Movimiento> movimientos=new ArrayList<>();
  for(var k:registros){
   long cantidad=k.getCantidad(); if(cantidad>0)entradas+=cantidad;else salidas-=cantidad;
   boolean ajuste=k.getTipoMovimiento().name().startsWith("AJUSTE_");if(ajuste)ajustes++;
   BigDecimal costo=k.getCostoUnitarioRegistrado();if(costo!=null&&costo.signum()<=0)costo=null;
   BigDecimal importe=costo==null?null:costo.multiply(BigDecimal.valueOf(Math.abs(cantidad)));
   if((k.getTipoMovimiento()==TipoMovimiento.AJUSTE_MERMA||k.getTipoMovimiento()==TipoMovimiento.AJUSTE_VENCIMIENTO)&&cantidad<0){
    mermas-=cantidad;if(importe==null)sinCostoMerma-=cantidad;else costoMerma=costoMerma.add(importe);
   }
   movimientos.add(new Movimiento(k.getId(),k.getProductoId(),k.getLote()==null?null:k.getLote().getNumeroLote(),k.getTipoMovimiento(),k.getCantidad(),k.getSaldoResultante(),k.getReferenciaTipo(),k.getReferenciaId(),k.getMotivo(),k.getUsuarioId(),k.getFechaHora().toInstant(ZoneOffset.UTC),costo,importe));
  }
  Map<Long,List<Lote>> porProducto=new TreeMap<>();Map<Long,Long> stock=new TreeMap<>();
  for(var l:saldos)porProducto.computeIfAbsent(l.getProductoId(),id->new ArrayList<>()).add(l);
  for(var s:consolidados)stock.put(s.getProductoId(),(long)s.getStockActual());
  Set<Long> ids=new TreeSet<>(stock.keySet());ids.addAll(porProducto.keySet());
  List<Valoracion> valoracion=new ArrayList<>();BigDecimal valor=BigDecimal.ZERO;long sinCosto=0,diferencias=0;
  LocalDate hoy=corte.atZone(ZoneId.of("America/Lima")).toLocalDate();
  for(Long id:ids){long unidades=0,sinValorar=0,noDisponibles=0;BigDecimal importe=BigDecimal.ZERO;var lista=porProducto.getOrDefault(id,List.of());
   for(var l:lista){unidades+=l.getCantidadActual();BigDecimal costo=l.getCostoUnitario();
    if(costo==null||costo.signum()<=0)sinValorar+=l.getCantidadActual();else importe=importe.add(costo.multiply(BigDecimal.valueOf(l.getCantidadActual())));
    if(l.getEstado()!=EstadoLote.DISPONIBLE||l.getFechaVencimiento().isBefore(hoy))noDisponibles+=l.getCantidadActual();
   }
   long consolidado=stock.getOrDefault(id,0L);long diferencia=consolidado-unidades;if(diferencia!=0)diferencias++;
   valor=valor.add(importe);sinCosto+=sinValorar;valoracion.add(new Valoracion(id,consolidado,unidades,diferencia,importe,sinValorar,lista.size(),noDisponibles));
  }
  return new ReporteInventarioResponse(sucursal,desde,hasta,"America/Lima",corte,new Resumen(entradas,salidas,ajustes,mermas,costoMerma,sinCostoMerma,valor,sinCosto,diferencias),movimientos,valoracion);
 }
}
