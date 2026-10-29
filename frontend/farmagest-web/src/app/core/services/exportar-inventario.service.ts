import { Injectable } from '@angular/core';
import { MovimientoReporte, ValoracionReporte, ProductoReporte, ReporteInventario, SeccionInventario, TIPOS_INVENTARIO, fechaHoraLima, TipoMovimientoInventario } from '../models/reporte-inventario.models';
export interface DatosExportacionInventario {reporte:ReporteInventario;productos:ProductoReporte[];seccion:SeccionInventario;busqueda:string;tipo:string;movimientos:MovimientoReporte[];valoracion:ValoracionReporte[];}
export function tablaInventario(ctx:DatosExportacionInventario):{titulo:string;cabeceras:string[];filas:(string|number)[][];notas:string[];monedas:number[]}{
 const mapa=new Map(ctx.productos.map(p=>[p.id,p]));
 const notas=[`Sucursal ${ctx.reporte.sucursalId}. Fechas de movimientos: ${ctx.reporte.desde} a ${ctx.reporte.hasta} (America/Lima).`,
  `Filtro de tabla: ${ctx.busqueda||'ninguno'}. Tipo: ${TIPOS_INVENTARIO[ctx.tipo as TipoMovimientoInventario]||'Todos'}.`,
  'Cantidades en la unidad de inventario registrada. Sin conversiones de presentación.'];
 if(ctx.seccion==='VALORACION'){
  notas.push(`Stock actual consultado: ${fechaHoraLima(ctx.reporte.corteActualEn)}. No representa el stock de las fechas seleccionadas.`);
  notas.push('Valor conocido = suma de cantidad actual por costo de cada lote. Incluye lotes con saldo, incluso vencidos o en cuarentena.');
  return {titulo:'Valorización del inventario actual',cabeceras:['Producto','Código','Presentación','Stock consolidado','Stock en lotes','Diferencia','Lotes con saldo','No disponibles','Sin costo (unidades)','Valor conocido (S/)'],
   filas:ctx.valoracion.map(v=>{const p=mapa.get(v.productoId);return [p?.nombre||`Producto #${v.productoId}`,p?.codigoBarras||'',p?.presentacion||'No disponible',v.stockConsolidado,v.stockEnLotes,v.diferencia,v.lotesConSaldo,v.unidadesNoDisponibles,v.unidadesSinCosto,v.valorConocido];}),notas,monedas:[9]};
 }
 notas.push('Los costos históricos ausentes no se reemplazan por el precio actual. Importe = magnitud del movimiento por costo registrado. No es ingreso de ventas.');
 return {titulo:ctx.seccion==='AJUSTES'?'Mermas y ajustes de inventario':'Movimientos de inventario',cabeceras:['Fecha y hora Lima','Producto / presentación','Código','Lote','Movimiento','Cantidad (+/-)','Saldo registrado','Referencia / motivo / usuario','Costo unit. registrado (S/)','Importe absoluto (S/)'],
 filas:ctx.movimientos.map(m=>{const p=mapa.get(m.productoId);return [fechaHoraLima(m.fechaHora),`${p?.nombre||'Producto #'+m.productoId}\n${p?.presentacion||'Presentación no disponible'}`,p?.codigoBarras||'',m.numeroLote||'Sin lote',TIPOS_INVENTARIO[m.tipoMovimiento]||m.tipoMovimiento,m.cantidad,m.saldoResultante,`${m.referenciaTipo||''} ${m.referenciaId||''}\n${m.motivo||'Sin motivo registrado'}\nUsuario ID: ${m.usuarioId}`,m.costoUnitarioRegistrado??'Sin costo histórico',m.costoMovimiento??'Sin valorar'];}),notas,monedas:[8,9]};
}
@Injectable({providedIn:'root'})
export class ExportarInventarioService {
 async generar(ctx:DatosExportacionInventario,formato:'PDF'|'EXCEL'):Promise<File>{
  const tabla=tablaInventario(ctx);const nombre=`inventario-${ctx.seccion.toLowerCase()}-${ctx.reporte.desde}-${ctx.reporte.hasta}`;
  if(formato==='EXCEL'){
   const {default:writeExcel}=await import('write-excel-file/universal');
   const datos:import('write-excel-file/universal').SheetData=[
    [{value:tabla.titulo,type:String,columnSpan:tabla.cabeceras.length,fontWeight:'bold',fontSize:16,textColor:'#FFFFFF',backgroundColor:'#0F4F46',height:30}],
    ...tabla.notas.map(nota=>[{value:nota,type:String,columnSpan:tabla.cabeceras.length,wrap:true,height:30,fontSize:11,textColor:'#4F625D'}]),
    [],
    tabla.cabeceras.map(value=>({value,type:String,fontWeight:'bold',backgroundColor:'#0F4F46',textColor:'#FFFFFF',wrap:true,height:34}))
   ];
   const filasFijas=datos.length;
   for(const [index,values] of tabla.filas.entries()){
    const lineas=Math.max(...values.map(v=>String(v).split('\n').reduce((n,linea)=>n+Math.max(1,Math.ceil(linea.length/35)),0)));
    datos.push(values.map((value,i)=>({value,type:typeof value==='number'?Number:String,wrap:true,alignVertical:'top',height:Math.max(36,lineas*13),fontSize:11,backgroundColor:index%2===0?'#F1F7F4':'#FFFFFF',
     ...(typeof value==='number'&&tabla.monedas.includes(i)?{format:'"S/ "#,##0.00'}:{})})));
   }
   const blob=await writeExcel(datos,{sheet:'Reporte',orientation:'landscape',stickyRowsCount:filasFijas,columns:tabla.cabeceras.map((_,i)=>({width:i===1||i===7?42:22}))}).toBlob();
   return new File([blob],nombre+'.xlsx',{type:blob.type});
  }
  const [{jsPDF},{autoTable}]=await Promise.all([import('jspdf'),import('jspdf-autotable')]);
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
  const seguro=(valor:string|number)=>String(valor).replace(/[^\x20-\x7e\xa0-\xff\n]/g,'?');
  const cabecera=()=>{doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(15,79,70);doc.text('FarmaGest',12,15);doc.setFontSize(12);doc.text(seguro(tabla.titulo),12,23);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(65,85,75);doc.text(seguro(tabla.notas[0]),12,30);doc.text(seguro(tabla.notas[1]).slice(0,170),12,35);};cabecera();
  const notas=doc.splitTextToSize(tabla.notas.slice(2).map(seguro).join(' '),273);doc.setFontSize(7);doc.text(notas,12,42);const inicio=45+notas.length*3;
  doc.setProperties({title:tabla.titulo,author:'FarmaGest',subject:'Reporte interno de inventario'});
  autoTable(doc,{startY:inicio,margin:{left:12,right:12,top:44,bottom:14},head:[tabla.cabeceras],body:tabla.filas.map(row=>row.map((cell,i)=>typeof cell==='number'&&tabla.monedas.includes(i)?`S/ ${cell.toFixed(2)}`:seguro(cell))),
   theme:'grid',styles:{font:'helvetica',fontSize:7,cellPadding:2,overflow:'linebreak',lineColor:[218,229,222],lineWidth:.15, valign:'top'},headStyles:{fillColor:[15,79,70],textColor:255},alternateRowStyles:{fillColor:[245,249,246]},rowPageBreak:'avoid',
   didDrawPage:(data: any)=>{if(data.pageNumber>1)cabecera();}});
  if(!tabla.filas.length){doc.setTextColor(70,90,80);doc.text('Sin registros para los filtros seleccionados.',12,inicio+18);}
  const paginas=doc.getNumberOfPages();for(let n=1;n<=paginas;n++){doc.setPage(n);doc.setFontSize(7);doc.setTextColor(80,100,90);doc.text(`Registros exportados: ${tabla.filas.length}. Incluye todas las páginas de la tabla filtrada.`,12,202);doc.text(`Página ${n} de ${paginas}`,285,202,{align:'right'});}
  return new File([doc.output('arraybuffer')],nombre+'.pdf',{type:'application/pdf'});
 }
}
