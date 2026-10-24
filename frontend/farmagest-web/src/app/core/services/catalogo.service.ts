import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Producto,
  Categoria,
  Laboratorio,
  HistorialPrecio,
  CrearProductoRequest,
  ActualizarProductoRequest,
  CambiarPrecioRequest,
  PageResponse
} from '../models/catalogo.models';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly apiUrl = 'http://localhost:8080/api/catalogo';

  constructor(private http: HttpClient) {}

  listarProductos(
    page: number = 0,
    size: number = 10,
    q?: string,
    categoriaId?: number,
    activo?: boolean,
    requiereReceta?: boolean
  ): Observable<PageResponse<Producto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }
    if (categoriaId !== undefined && categoriaId !== null) {
      params = params.set('categoriaId', categoriaId.toString());
    }
    if (activo !== undefined && activo !== null) {
      params = params.set('activo', activo.toString());
    }
    if (requiereReceta !== undefined && requiereReceta !== null) {
      params = params.set('requiereReceta', requiereReceta.toString());
    }

    return this.http.get<PageResponse<Producto>>(`${this.apiUrl}/productos`, { params });
  }

  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  obtenerProductoPorCodigo(codigoBarras: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/codigo/${encodeURIComponent(codigoBarras)}`);
  }

  crearProducto(request: CrearProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, request);
  }

  actualizarProducto(id: number, request: ActualizarProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, request);
  }

  cambiarPrecio(id: number, request: CambiarPrecioRequest): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/productos/${id}/precio`, request);
  }

  cambiarEstado(id: number, activo: boolean): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/productos/${id}/estado`, null, {
      params: { activo: activo.toString() }
    });
  }

  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`);
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  listarLaboratorios(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(`${this.apiUrl}/laboratorios`);
  }

  obtenerHistorialPrecios(productoId: number): Observable<HistorialPrecio[]> {
    return this.http.get<HistorialPrecio[]>(`${this.apiUrl}/productos/${productoId}/historial-precios`);
  }
}
