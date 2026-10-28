import { Component, Input, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuiaInternaService } from '../../core/services/guia-interna.service';
import { PdfDocumentoService } from '../../core/services/pdf-documento.service';
@Component({selector:'app-guia-compra',standalone:true,imports:[CommonModule],templateUrl:'./guia-compra.component.html',styleUrl:'./guia-compra.component.css'})
export class GuiaCompraComponent implements OnDestroy {
 @Input() ordenId:number|null=null; @Input() ingresoId:number|null=null;
 ocupado=signal(false);error=signal('');archivo:File|null=null;paginas:string[]=[];abierto=false;private destruido=false;
 constructor(private guias:GuiaInternaService,private pdf:PdfDocumentoService){}
 async ver():Promise<void>{
  if(this.ocupado())return;this.ocupado.set(true);this.error.set('');
  try{const archivo=await this.guias.obtener(this.ordenId,this.ingresoId);if(this.destruido)return;
   const paginas=await this.pdf.imagenes(archivo);if(this.destruido)return;
   this.archivo=archivo;this.paginas=paginas;this.abierto=true;
  }catch(err){if(!this.destruido)this.error.set(this.mensaje(err));}finally{if(!this.destruido)this.ocupado.set(false);}
 }
 async descargar():Promise<void>{
  if(this.ocupado())return;this.ocupado.set(true);this.error.set('');
  try{const archivo=await this.guias.obtener(this.ordenId,this.ingresoId);if(this.destruido)return;this.archivo=archivo;
   const url=URL.createObjectURL(archivo);const link=document.createElement('a');link.href=url;link.download=archivo.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }catch(err){if(!this.destruido)this.error.set(this.mensaje(err));}finally{if(!this.destruido)this.ocupado.set(false);}
 }
 async prepararImpresion():Promise<void>{
  if(!this.paginas.length){await this.ver();return;} this.imprimir();
 }
 imprimir():void{
  if(!this.paginas.length)return;const ventana=window.open('','_blank');if(!ventana){this.error.set('Permite la ventana de impresión o descarga el PDF para imprimirlo.');return;}
  ventana.opener=null;ventana.document.title='Guía interna de recepción';const style=ventana.document.createElement('style');style.textContent='body{margin:0}img{display:block;width:100%;page-break-after:always}img:last-child{page-break-after:auto}@page{size:A4;margin:0}';ventana.document.head.appendChild(style);
  Promise.all(this.paginas.map(src=>new Promise<void>(resolve=>{const img=ventana.document.createElement('img');img.onload=()=>resolve();img.onerror=()=>resolve();img.src=src;img.alt='Página de guía interna';ventana.document.body.appendChild(img);}))).then(()=>{ventana.focus();ventana.print();});
 }
 private mensaje(err:unknown):string{
  const status=(err as {status?:number})?.status;
  if(status===401||status===403)return 'Inicia sesión nuevamente para consultar la compra y generar su guía.';
  return err instanceof Error?err.message:'No se pudo generar la guía. Revisa tu conexión y vuelve a intentarlo.';
 }
 ngOnDestroy():void{this.destruido=true;this.paginas=[];}
}
