import { Component, EventEmitter, Input, Output, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { PdfDocumentoService } from '../../core/services/pdf-documento.service';
import { ComprasService } from '../../core/services/compras.service';
@Component({ selector:'app-guia-adjunta', standalone:true, imports:[CommonModule], templateUrl:'./guia-adjunta.component.html', styleUrl:'./guia-adjunta.component.css' })
export class GuiaAdjuntaComponent implements OnDestroy {
 @Input() archivo: File | null = null;
 @Input() ingresoId: number | null = null;
 @Input() guardado = false;
 @Input() editable = true;
 @Output() archivoCambio = new EventEmitter<File | null>();
 @Output() adjuntado = new EventEmitter<void>();
 ocupado=signal(false);error=signal('');abierto=false;paginas:string[]=[];nombre='';
 private remoto:File|null=null;private destruido=false;private revision=0;
 constructor(private pdf:PdfDocumentoService,private compras:ComprasService){}
 async seleccionar(event:Event):Promise<void>{
  const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';if(!file)return;
  if(!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type)||!file.size||file.size>12*1024*1024){this.error.set('Adjunta PDF, JPG, PNG o WebP de hasta 12 MB.');return;}
  this.error.set('');this.archivo=file;this.archivoCambio.emit(file);this.paginas=[];this.abierto=false;
 }
 quitar():void{this.archivo=null;this.archivoCambio.emit(null);this.paginas=[];this.abierto=false;}
 private async obtener():Promise<File>{
  if(this.archivo)return this.archivo;
  if(this.remoto)return this.remoto;
  if(!this.ingresoId)throw new Error('Adjunta primero la guía.');
  const respuesta=await firstValueFrom(this.compras.descargarGuia(this.ingresoId));
  const disposition=respuesta.headers.get('Content-Disposition')||'';
  const utf=disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const simple=disposition.match(/filename="([^"]+)"/i);
  const extension=respuesta.body?.type==='image/png'?'png':respuesta.body?.type==='image/jpeg'?'jpg':respuesta.body?.type==='image/webp'?'webp':'pdf';
  let nombre=simple?.[1]||`guia-recepcion.${extension}`;
  if(utf){try{nombre=decodeURIComponent(utf[1]);}catch{}}
  if(!respuesta.body)throw new Error('No se recibió el documento.');
  this.remoto=new File([respuesta.body],nombre,{type:respuesta.body.type});return this.remoto;
 }
 async ver():Promise<void>{
  if(this.ocupado())return;this.ocupado.set(true);this.error.set('');const revision=++this.revision;
  try{const file=await this.obtener();this.nombre=file.name;
   const paginas=file.type==='application/pdf'?await this.pdf.imagenes(file):[await this.imagen(file)];
   if(this.destruido||revision!==this.revision)return;this.paginas=paginas;this.abierto=true;
  }catch{if(!this.destruido)this.error.set('No se pudo abrir la guía. Revisa tu sesión, el archivo o descárgalo para verlo en tu equipo.');}
  finally{if(!this.destruido)this.ocupado.set(false);}
 }
 private imagen(file:File):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});}
 async descargar():Promise<void>{
  if(this.ocupado())return;this.ocupado.set(true);this.error.set('');
  try{const file=await this.obtener();if(this.destruido)return;const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  catch{if(!this.destruido)this.error.set('No se pudo descargar la guía. Revisa tu sesión y conexión.');}
  finally{if(!this.destruido)this.ocupado.set(false);}
 }
 imprimir():void{
  if(!this.paginas.length)return;const ventana=window.open('','_blank');if(!ventana){this.error.set('Permite la ventana de impresión en el navegador.');return;}
  ventana.opener=null;ventana.document.title='Imprimir guía';
  const style=ventana.document.createElement('style');style.textContent='body{margin:0}img{display:block;width:100%;page-break-after:always}img:last-child{page-break-after:auto}@page{margin:8mm}';ventana.document.head.appendChild(style);
  Promise.all(this.paginas.map(src=>new Promise<void>(resolve=>{const img=ventana.document.createElement('img');img.onload=()=>resolve();img.onerror=()=>resolve();img.src=src;img.alt='Página de guía';ventana.document.body.appendChild(img);}))).then(()=>{ventana.focus();ventana.print();});
 }
 async guardarAdjunto():Promise<void>{
  if(!this.ingresoId||!this.archivo||this.ocupado())return;this.ocupado.set(true);this.error.set('');
  try{await firstValueFrom(this.compras.adjuntarGuia(this.ingresoId,this.archivo));if(this.destruido)return;this.remoto=this.archivo;this.guardado=true;this.archivo=null;this.archivoCambio.emit(null);this.adjuntado.emit();}
  catch{if(!this.destruido)this.error.set('No se pudo guardar el adjunto. La recepción permanece registrada. Si ya tiene una guía, no se reemplaza.');}
  finally{if(!this.destruido)this.ocupado.set(false);}
 }
 ngOnDestroy():void{this.destruido=true;this.revision++;this.paginas=[];}
}
