import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReporteInventario } from '../models/reporte-inventario.models';
@Injectable({providedIn:'root'})
export class ReporteInventarioService {
 constructor(private http:HttpClient){}
 consultar(desde:string,hasta:string,sucursalId:number,productoId:number|null){
  let params=new HttpParams().set('desde',desde).set('hasta',hasta).set('sucursalId',String(sucursalId));
  if(productoId)params=params.set('productoId',String(productoId));
  return this.http.get<ReporteInventario>('http://localhost:8080/api/inventario/reportes',{params});
 }
}
