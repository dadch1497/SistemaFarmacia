import { MovimientoKardex } from './inventario.models';
export type TipoMovimientoInventario = MovimientoKardex['tipoMovimiento'];
export interface MovimientoReporte {
 id:number;productoId:number;numeroLote:string|null;tipoMovimiento:TipoMovimientoInventario;cantidad:number;saldoResultante:number;
 referenciaTipo:string|null;referenciaId:string|null;motivo:string|null;usuarioId:number;fechaHora:string;
 costoUnitarioRegistrado:number|null;costoMovimiento:number|null;
}
export interface ValoracionReporte {
 productoId:number;stockConsolidado:number;stockEnLotes:number;diferencia:number;valorConocido:number;unidadesSinCosto:number;lotesConSaldo:number;unidadesNoDisponibles:number;
}
export interface ResumenInventario {
 entradas:number;salidas:number;ajustes:number;unidadesMerma:number;costoMermasRegistrado:number;unidadesMermaSinCosto:number;
 valorActualConocido:number;unidadesActualesSinCosto:number;productosConDiferencia:number;
}
export interface ReporteInventario {
 sucursalId:number;desde:string;hasta:string;zonaHoraria:string;corteActualEn:string;resumen:ResumenInventario;movimientos:MovimientoReporte[];valoracion:ValoracionReporte[];
}
export interface ProductoReporte {id:number;nombre:string;codigoBarras:string;presentacion:string;}
export type SeccionInventario = 'MOVIMIENTOS'|'AJUSTES'|'VALORACION';
export const TIPOS_INVENTARIO:Record<TipoMovimientoInventario,string>={INGRESO_COMPRA:'Ingreso por compra',SALIDA_VENTA:'Salida por venta',DEVOLUCION_CLIENTE:'Devolución de cliente',AJUSTE_MERMA:'Merma',AJUSTE_SOBRANTE:'Ajuste por sobrante',AJUSTE_VENCIMIENTO:'Baja por vencimiento',INGRESO_INICIAL:'Ingreso inicial'};
export function fechaHoraLima(iso:string):string {
 const fecha=new Date(iso);return Number.isFinite(fecha.getTime())?new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',dateStyle:'short',timeStyle:'short'}).format(fecha):'—';
}
export function normalizarReporte(texto:string):string{return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();}
export function filtrarMovimientos(filas:MovimientoReporte[],productos:ProductoReporte[],busqueda:string,tipo:string,seccion:SeccionInventario):MovimientoReporte[]{
 const q=normalizarReporte(busqueda);const mapa=new Map(productos.map(p=>[p.id,p]));
 return filas.filter(f=>{
  if(seccion==='AJUSTES'&&!f.tipoMovimiento.startsWith('AJUSTE_'))return false;
  if(tipo&&f.tipoMovimiento!==tipo)return false;
  const p=mapa.get(f.productoId);
  return !q||normalizarReporte(`${p?.nombre||'Producto #'+f.productoId} ${p?.codigoBarras||''} ${p?.presentacion||''} ${f.numeroLote||''} ${f.referenciaId||''} ${f.motivo||''} ${TIPOS_INVENTARIO[f.tipoMovimiento]}`).includes(q);
 });
}
export function filtrarValoracion(filas:ValoracionReporte[],productos:ProductoReporte[],busqueda:string):ValoracionReporte[]{
 const q=normalizarReporte(busqueda);const mapa=new Map(productos.map(p=>[p.id,p]));
 return filas.filter(f=>{const p=mapa.get(f.productoId);return !q||normalizarReporte(`${p?.nombre||'Producto #'+f.productoId} ${p?.codigoBarras||''} ${p?.presentacion||''}`).includes(q);});
}
export function validarPeriodoInventario(desde:string,hasta:string):string {
 const fecha=(v:string)=>{const d=new Date(v+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v?d.getTime():null;};
 const a=fecha(desde),b=fecha(hasta);if(a===null||b===null)return 'Selecciona las fechas Desde y Hasta.';
 if(b<a)return 'La fecha Hasta debe ser igual o posterior a Desde.';
 if((b-a)/86400000>365)return 'Consulta como máximo 366 días por reporte.';return '';
}
