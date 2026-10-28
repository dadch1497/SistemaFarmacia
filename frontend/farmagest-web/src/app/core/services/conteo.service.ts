import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface ConteoLinea {productoId:number;nombre:string;codigo:string;presentacion:string;cantidad:number;usuarioId:number;contadoEn:string;observacion:string;esperado:number|null;diferencia:number|null;resultado:string|null;}
export interface Conteo {id:number;sucursalId:number;referencia:string;usuarioId:number;creadoEn:string;cerradoEn:string|null;estado:string;tieneFoto:boolean;revision:string|null;revisadoPor:number|null;revisadoEn:string|null;lineas:ConteoLinea[];eventos:{usuarioId:number;fecha:string;accion:string;detalle:string}[];}
export function resultadoConteo(linea:ConteoLinea):string {return ({CONFORME:'Conforme',FALTANTE:'Faltante',SOBRANTE:'Sobrante',REQUIERE_RECONTEO:'Requiere reconteo'} as Record<string,string>)[linea.resultado||'']||'Pendiente de comparación';}
@Injectable({providedIn:'root'})
export class ConteoService {
 private readonly url='http://localhost:8080/api/inventario/conteos';
 constructor(private http:HttpClient){}
 listar(sucursalId:number,pagina=0){return this.http.get<Conteo[]>(this.url,{params:{sucursalId,pagina}});}
 ver(id:number){return this.http.get<Conteo>(`${this.url}/${id}`);}
 crear(sucursalId:number,referencia:string){return this.http.post<Conteo>(this.url,{sucursalId,referencia});}
 contar(id:number,productoId:number,cantidad:number,observacion:string){return this.http.put<Conteo>(`${this.url}/${id}/lineas`,{productoId,cantidad,observacion});}
 finalizar(id:number){return this.http.post<Conteo>(`${this.url}/${id}/finalizar`,{});}
 cancelar(id:number){return this.http.post<Conteo>(`${this.url}/${id}/cancelar`,{});}
 revisar(id:number,nota:string){return this.http.post<Conteo>(`${this.url}/${id}/revision`,{nota});}
 foto(id:number,file:File){const form=new FormData();form.append('foto',file);return this.http.post<Conteo>(`${this.url}/${id}/foto`,form);}
 obtenerFoto(id:number){return this.http.get(`${this.url}/${id}/foto`,{responseType:'blob'});}
}
