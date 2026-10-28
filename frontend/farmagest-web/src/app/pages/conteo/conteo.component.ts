import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';import { FormsModule } from '@angular/forms';import { RouterLink } from '@angular/router';
import { Observable, Subject, finalize, takeUntil, timeout } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';import { CatalogoService } from '../../core/services/catalogo.service';import { Producto } from '../../core/models/catalogo.models';
import { Conteo, ConteoLinea, ConteoService, resultadoConteo } from '../../core/services/conteo.service';
import { BarcodePhotoComponent } from '../../shared/barcode-photo/barcode-photo.component';
@Component({selector:'app-conteo',standalone:true,imports:[CommonModule,FormsModule,RouterLink,BarcodePhotoComponent],templateUrl:'./conteo.component.html',styleUrl:'./conteo.component.css'})
export class ConteoComponent implements OnInit,OnDestroy {
 historial=signal<Conteo[]>([]);sesion=signal<Conteo|null>(null);producto=signal<Producto|null>(null);resultados=signal<Producto[]>([]);
 ocupado=signal(false);buscando=signal(false);error=signal('');aviso=signal('');fotoUrl=signal('');pagina=signal(0);referencia='';codigo='';busqueda='';cantidad:number|null=null;observacion='';nota='';accionPendiente=signal<'finalizar'|'cancelar'|null>(null);
 private fin=new Subject<void>();private revisionBusqueda=0;
 sucursal=computed(()=>this.auth.currentUser()?.sucursalId||1);admin=computed(()=>this.auth.hasAnyRole(['ROLE_ADMINISTRADOR']));
 puedeEditar=computed(()=>this.sesion()?.estado==='ABIERTO'&&(this.admin()||this.sesion()?.usuarioId===this.auth.currentUser()?.id));
 resumen=computed(()=>{const l=this.sesion()?.lineas||[];return {contados:l.length,faltantes:l.filter(x=>x.resultado==='FALTANTE').length,sobrantes:l.filter(x=>x.resultado==='SOBRANTE').length,reconteo:l.filter(x=>x.resultado==='REQUIERE_RECONTEO').length};});
 resultado=resultadoConteo;
 constructor(public auth:AuthService,private api:ConteoService,private catalogo:CatalogoService){}
 ngOnInit(){this.cargarHistorial();}
 private mensaje(e:any){return e.status===401||e.status===403?'Tu sesión no permite esta operación. Inicia sesión como administrador o almacenero.':e.error?.detail||e.error?.message||(e.name==='TimeoutError'?'La solicitud tardó demasiado. Actualiza el conteo para comprobar si se guardó antes de repetirla.':'No se pudo completar la operación. Revisa la conexión y actualiza antes de repetir.');}
 ejecutar<T>(req:Observable<T>,done:(data:T)=>void){if(this.ocupado())return;this.ocupado.set(true);this.error.set('');this.aviso.set('');req.pipe(timeout(20000),takeUntil(this.fin),finalize(()=>this.ocupado.set(false))).subscribe({next:done,error:e=>this.error.set(this.mensaje(e))});}
 cargarHistorial(){this.ejecutar(this.api.listar(this.sucursal(),this.pagina()),data=>this.historial.set(data));}
 cambiarPagina(delta:number){if(this.ocupado())return;this.pagina.update(p=>Math.max(0,p+delta));this.cargarHistorial();}
 abrir(id:number){this.ejecutar(this.api.ver(id),s=>{this.seleccionarSesion(s);});}
 private seleccionarSesion(s:Conteo){this.sesion.set(s);this.producto.set(null);this.resultados.set([]);this.cantidad=null;this.nota='';this.accionPendiente.set(null);this.limpiarFoto();this.revisionBusqueda++;}
 crear(){if(!this.referencia.trim())return;this.ejecutar(this.api.crear(this.sucursal(),this.referencia.trim()),s=>{this.seleccionarSesion(s);this.historial.update(rows=>[s,...rows.filter(x=>x.id!==s.id)].slice(0,20));});}
 private aceptar(s:Conteo){this.sesion.set(s);this.historial.update(rows=>rows.map(c=>c.id===s.id?s:c));this.accionPendiente.set(null);}
 seleccionar(p:Producto){this.producto.set(p);const existente=this.sesion()?.lineas.find(l=>l.productoId===p.id);this.cantidad=existente?.cantidad??null;this.observacion=existente?.observacion||'';this.resultados.set([]);}
 buscarCodigo(codigo:string){if(!codigo.trim()||this.buscando()||this.ocupado()||!this.puedeEditar())return;const revision=++this.revisionBusqueda;this.buscando.set(true);this.error.set('');this.producto.set(null);this.catalogo.obtenerProductoPorCodigo(codigo.trim()).pipe(timeout(12000),takeUntil(this.fin),finalize(()=>this.buscando.set(false))).subscribe({next:p=>{if(revision===this.revisionBusqueda)this.seleccionar(p);},error:e=>{if(revision===this.revisionBusqueda)this.error.set(e.status===404?'Código no registrado. No se agregó ningún producto.':this.mensaje(e));}});}
 buscarNombre(){if(!this.busqueda.trim()||this.buscando()||this.ocupado())return;const revision=++this.revisionBusqueda;this.buscando.set(true);this.error.set('');this.catalogo.listarProductos(0,30,this.busqueda.trim()).pipe(timeout(12000),takeUntil(this.fin),finalize(()=>this.buscando.set(false))).subscribe({next:r=>{if(revision===this.revisionBusqueda){this.resultados.set(r.content);this.aviso.set(r.content.length?'Selecciona el producto exacto. Se muestran hasta 30 coincidencias; afina la búsqueda si es necesario.':'No se encontraron coincidencias.');}},error:e=>this.error.set(this.mensaje(e))});}
 guardar(){const s=this.sesion(),p=this.producto();if(!s||!p||!this.puedeEditar()||!Number.isInteger(this.cantidad)||this.cantidad!<0||this.cantidad!>100000000)return;this.ejecutar(this.api.contar(s.id,p.id,this.cantidad!,this.observacion),data=>{this.aceptar(data);this.producto.set(null);this.cantidad=null;this.observacion='';this.codigo='';this.aviso.set('Cantidad física guardada. El stock esperado sigue oculto hasta finalizar.');});}
 editar(l:ConteoLinea){if(!this.puedeEditar())return;this.ejecutar(this.catalogo.obtenerProductoPorId(l.productoId),p=>this.seleccionar(p));}
 confirmarAccion(){const s=this.sesion(),accion=this.accionPendiente();if(!s||!accion)return;this.ejecutar(accion==='finalizar'?this.api.finalizar(s.id):this.api.cancelar(s.id),data=>this.aceptar(data));}
 revisar(){const s=this.sesion();if(!s||!this.admin()||!this.nota.trim())return;this.ejecutar(this.api.revisar(s.id,this.nota.trim()),data=>this.aceptar(data));}
 adjuntar(event:Event){const input=event.target as HTMLInputElement,file=input.files?.[0],s=this.sesion();input.value='';if(!file||!s||!this.puedeEditar())return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){this.error.set('Usa JPG, PNG o WebP de hasta 8 MB.');return;}this.ejecutar(this.api.foto(s.id,file),data=>this.aceptar(data));}
 verFoto(){const s=this.sesion();if(!s)return;this.ejecutar(this.api.obtenerFoto(s.id),blob=>{this.limpiarFoto();this.fotoUrl.set(URL.createObjectURL(blob));});}
 limpiarFoto(){if(this.fotoUrl())URL.revokeObjectURL(this.fotoUrl());this.fotoUrl.set('');}
 fecha(value:string|null){return value?new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'—';}
 ngOnDestroy(){this.fin.next();this.fin.complete();this.limpiarFoto();}
}
