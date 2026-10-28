import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Subject, takeUntil, timeout } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { ReporteInventarioService } from '../../core/services/reporte-inventario.service';
import { ExportarInventarioService } from '../../core/services/exportar-inventario.service';
import { ReporteInventario, ProductoReporte, SeccionInventario, TIPOS_INVENTARIO, fechaHoraLima, filtrarMovimientos, filtrarValoracion, validarPeriodoInventario } from '../../core/models/reporte-inventario.models';
@Component({selector:'app-reporte-inventario',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./reporte-inventario.component.html',styleUrl:'./reporte-inventario.component.css'})
export class ReporteInventarioComponent implements OnInit,OnDestroy {
 reporte=signal<ReporteInventario|null>(null);productos=signal<ProductoReporte[]>([]);cargando=signal(false);exportando=signal(false);error=signal('');avisoCatalogo=signal('');
 seccion=signal<SeccionInventario>('MOVIMIENTOS');busqueda=signal('');tipo=signal('');desde='';hasta='';productoId:number|null=null;pagina=signal(1);readonly porPagina=50;
 readonly tipos=Object.entries(TIPOS_INVENTARIO).map(([value,label])=>({value,label}));readonly etiquetas=TIPOS_INVENTARIO;
 readonly nombres=computed(()=>new Map(this.productos().map(p=>[p.id,p])));
 readonly movimientos=computed(()=>filtrarMovimientos(this.reporte()?.movimientos||[],this.productos(),this.busqueda(),this.tipo(),this.seccion()));
 readonly valoraciones=computed(()=>filtrarValoracion(this.reporte()?.valoracion||[],this.productos(),this.busqueda()));
 readonly cantidadFilas=computed(()=>this.seccion()==='VALORACION'?this.valoraciones().length:this.movimientos().length);
 readonly totalPaginas=computed(()=>Math.max(1,Math.ceil(this.cantidadFilas()/this.porPagina)));
 readonly movimientosPagina=computed(()=>this.movimientos().slice((this.pagina()-1)*this.porPagina,this.pagina()*this.porPagina));
 readonly valoracionPagina=computed(()=>this.valoraciones().slice((this.pagina()-1)*this.porPagina,this.pagina()*this.porPagina));
 sucursalId=1;productoConsultado:number|null=null;private revision=0;private cancelar=new Subject<void>();
 constructor(private api:ReporteInventarioService,private catalogo:CatalogoService,private auth:AuthService,private exportador:ExportarInventarioService){}
 ngOnInit():void{
  this.sucursalId=this.auth.currentUser()?.sucursalId||1;
  this.hasta=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const inicio=new Date(this.hasta+'T12:00:00Z');inicio.setUTCDate(inicio.getUTCDate()-29);this.desde=inicio.toISOString().slice(0,10);void this.consultar();
 }
 get filtrosPendientes():boolean{const r=this.reporte();return !!r&&(r.desde!==this.desde||r.hasta!==this.hasta||this.productoConsultado!==(this.productoId?Number(this.productoId):null));}
 nombre(id:number):string{return this.nombres().get(id)?.nombre||`Producto #${id}`;}
 presentacion(id:number):string{return this.nombres().get(id)?.presentacion||'Presentación no disponible';}
 codigo(id:number):string{return this.nombres().get(id)?.codigoBarras||'—';}
 fecha(iso:string):string{return fechaHoraLima(iso);}
 cambiarSeccion(seccion:SeccionInventario):void{this.seccion.set(seccion);this.tipo.set('');this.pagina.set(1);}
 cambiarFiltro():void{this.pagina.set(1);}
 async consultar():Promise<void>{
  const validacion=validarPeriodoInventario(this.desde,this.hasta);if(validacion){this.error.set(validacion);return;}
  this.cancelar.next();const revision=++this.revision;this.cargando.set(true);this.error.set('');this.avisoCatalogo.set('');this.reporte.set(null);this.pagina.set(1);
  const producto=this.productoId?Number(this.productoId):null;
  try{
   const reporte=await firstValueFrom(this.api.consultar(this.desde,this.hasta,this.sucursalId,producto).pipe(takeUntil(this.cancelar),timeout(20000)));
   if(revision!==this.revision)return;
   const ids=new Set([...reporte.movimientos.map(m=>m.productoId),...reporte.valoracion.map(v=>v.productoId)]);
   const conocidos=new Map(this.productos().map(p=>[p.id,p]));
   try{
    for(let page=0;page<100;page++){
     const resp=await firstValueFrom(this.catalogo.listarProductos(page,200).pipe(takeUntil(this.cancelar),timeout(15000)));
     if(revision!==this.revision)return;
     for(const p of resp.content)conocidos.set(p.id,{id:p.id,nombre:p.nombre,codigoBarras:p.codigoBarras,presentacion:p.presentacion});
     if(page+1>=resp.totalPages||[...ids].every(id=>conocidos.has(id)))break;
    }
   }catch{if(revision!==this.revision)return;this.avisoCatalogo.set('El reporte se cargó, pero no se pudo completar el catálogo. Los productos no identificados se muestran con su ID.');}
   if([...ids].some(id=>!conocidos.has(id)))this.avisoCatalogo.set('Hay productos sin ficha disponible. El reporte conserva sus IDs; no se les asignan nombres de otros artículos.');
   this.productos.set([...conocidos.values()].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es')));this.productoConsultado=producto;this.reporte.set(reporte);
  }catch(err){if(revision!==this.revision)return;const e=err as {status?:number;error?:{detail?:string;message?:string}};
   this.error.set(e.status===401||e.status===403?'Tu sesión no permite consultar este reporte. Inicia sesión como administrador o almacenero.':e.status===422?'El período supera 10.000 movimientos. Reduce las fechas o selecciona un producto.':'No se pudo cargar el reporte de inventario. Revisa tu conexión y vuelve a consultar.');
  }finally{if(revision===this.revision)this.cargando.set(false);}
 }
 cancelarConsulta():void{this.revision++;this.cancelar.next();this.cargando.set(false);this.error.set('Consulta cancelada. Puedes volver a consultar cuando lo necesites.');}
 async exportar(formato:'PDF'|'EXCEL'):Promise<void>{
  const reporte=this.reporte();if(!reporte||this.cargando()||this.exportando()||this.filtrosPendientes)return;
  this.exportando.set(true);this.error.set('');
  try{const archivo=await this.exportador.generar({reporte,productos:this.productos(),seccion:this.seccion(),busqueda:this.busqueda(),tipo:this.tipo(),movimientos:this.movimientos(),valoracion:this.valoraciones()},formato);
   const url=URL.createObjectURL(archivo);const link=document.createElement('a');link.href=url;link.download=archivo.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }catch{this.error.set('No se pudo preparar el archivo. Reintenta la descarga.');}finally{this.exportando.set(false);}
 }
 ngOnDestroy():void{this.revision++;this.cancelar.next();this.cancelar.complete();}
}
