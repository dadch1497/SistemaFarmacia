import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Proveedor,
  CrearProveedorRequest,
  OrdenCompra,
  CrearOrdenCompraRequest,
  EstadoOrden,
  IngresoMercaderia,
  RegistrarIngresoRequest
} from '../models/compras.models';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  private readonly apiUrl = 'http://localhost:8080/api/compras';

  constructor(private http: HttpClient) {}

  // ==========================================
  // Proveedores
  // ==========================================
  listarProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`);
  }

  obtenerProveedor(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/proveedores/${id}`);
  }

  crearProveedor(request: CrearProveedorRequest): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.apiUrl}/proveedores`, request);
  }

  actualizarProveedor(id: number, request: CrearProveedorRequest): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/proveedores/${id}`, request);
  }

  darDeBajaProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/proveedores/${id}`);
  }

  // ==========================================
  // Órdenes de Compra
  // ==========================================
  listarOrdenes(sucursalId: number = 1): Observable<OrdenCompra[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<OrdenCompra[]>(`${this.apiUrl}/ordenes`, { params });
  }

  obtenerOrden(id: number): Observable<OrdenCompra> {
    return this.http.get<OrdenCompra>(`${this.apiUrl}/ordenes/${id}`);
  }

  crearOrden(request: CrearOrdenCompraRequest): Observable<OrdenCompra> {
    return this.http.post<OrdenCompra>(`${this.apiUrl}/ordenes`, request);
  }

  cambiarEstadoOrden(id: number, nuevoEstado: EstadoOrden): Observable<OrdenCompra> {
    const params = new HttpParams().set('nuevoEstado', nuevoEstado);
    return this.http.patch<OrdenCompra>(`${this.apiUrl}/ordenes/${id}/estado`, null, { params });
  }

  // ==========================================
  // Recepción de Mercadería (Ingresos)
  // ==========================================
  listarIngresos(sucursalId: number = 1): Observable<IngresoMercaderia[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<IngresoMercaderia[]>(`${this.apiUrl}/ingresos`, { params });
  }

  obtenerIngreso(id: number): Observable<IngresoMercaderia> {
    return this.http.get<IngresoMercaderia>(`${this.apiUrl}/ingresos/${id}`);
  }

  registrarIngreso(request: RegistrarIngresoRequest): Observable<IngresoMercaderia> {
    return this.http.post<IngresoMercaderia>(`${this.apiUrl}/ingresos`, request);
  }
}
