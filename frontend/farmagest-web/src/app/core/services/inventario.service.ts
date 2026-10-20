import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  StockProducto,
  Lote,
  MovimientoKardex,
  AlertaInventario,
  AjusteStockRequest
} from '../models/inventario.models';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private readonly apiUrl = 'http://localhost:8080/api/inventario';

  constructor(private http: HttpClient) {}

  listarStock(sucursalId: number = 1): Observable<StockProducto[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<StockProducto[]>(`${this.apiUrl}/stock`, { params });
  }

  obtenerStockPorProducto(productoId: number, sucursalId: number = 1): Observable<StockProducto> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<StockProducto>(`${this.apiUrl}/stock/producto/${productoId}`, { params });
  }

  listarStockBajo(sucursalId: number = 1): Observable<StockProducto[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<StockProducto[]>(`${this.apiUrl}/stock-bajo`, { params });
  }

  listarLotesPorProducto(productoId: number, sucursalId: number = 1): Observable<Lote[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<Lote[]>(`${this.apiUrl}/lotes/producto/${productoId}`, { params });
  }

  listarLotesPorVencer(dias: number = 30, sucursalId: number = 1): Observable<Lote[]> {
    const params = new HttpParams()
      .set('dias', dias.toString())
      .set('sucursalId', sucursalId.toString());
    return this.http.get<Lote[]>(`${this.apiUrl}/lotes/por-vencer`, { params });
  }

  registrarAjuste(request: AjusteStockRequest): Observable<MovimientoKardex> {
    return this.http.post<MovimientoKardex>(`${this.apiUrl}/ajustes`, request);
  }

  listarKardex(productoId: number, sucursalId: number = 1): Observable<MovimientoKardex[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<MovimientoKardex[]>(`${this.apiUrl}/kardex/producto/${productoId}`, { params });
  }

  listarAlertas(sucursalId: number = 1): Observable<AlertaInventario[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<AlertaInventario[]>(`${this.apiUrl}/alertas`, { params });
  }

  atenderAlerta(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alertas/${id}/atender`, null);
  }
}
