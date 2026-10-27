import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Caja,
  SesionCaja,
  AperturaCajaRequest,
  CierreCajaRequest,
  Cliente,
  CrearClienteRequest,
  Promocion,
  CrearPromocionForm,
  ValidarCuponRequest,
  ValidarCuponResponse,
  RegistrarVentaRequest,
  Venta,
  VentaEspera,
  GuardarVentaEsperaRequest,
  AnularVentaRequest,
  NotaCredito,
  EmitirNotaCreditoRequest
} from '../models/ventas.models';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly apiVentas = 'http://localhost:8080/api/ventas';
  private readonly apiCaja = 'http://localhost:8080/api/caja';

  constructor(private http: HttpClient) {}

  // ==========================================
  // Caja y Turnos
  // ==========================================
  listarCajas(sucursalId: number = 1): Observable<Caja[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<Caja[]>(`${this.apiCaja}/cajas`, { params });
  }

  obtenerMiTurno(sucursalId: number = 1): Observable<SesionCaja | null> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<SesionCaja | null>(`${this.apiCaja}/mi-turno`, { params });
  }

  aperturaCaja(request: AperturaCajaRequest): Observable<SesionCaja> {
    return this.http.post<SesionCaja>(`${this.apiCaja}/apertura`, request);
  }

  cierreCaja(sesionId: number, request: CierreCajaRequest): Observable<SesionCaja> {
    return this.http.post<SesionCaja>(`${this.apiCaja}/${sesionId}/cierre`, request);
  }

  listarSesiones(sucursalId: number = 1): Observable<SesionCaja[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<SesionCaja[]>(`${this.apiCaja}/sesiones`, { params });
  }

  // ==========================================
  // Clientes
  // ==========================================
  listarClientes(query?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    if (query && query.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<Cliente[]>(`${this.apiVentas}/clientes`, { params });
  }

  buscarClientePorDocumento(numero: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiVentas}/clientes/documento/${numero}`);
  }

  crearCliente(request: CrearClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiVentas}/clientes`, request);
  }

  // ==========================================
  // Promociones y Cupones
  // ==========================================
  listarPromociones(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiVentas}/promociones`);
  }

  crearPromocion(request: CrearPromocionForm): Observable<Promocion> {
    return this.http.post<Promocion>(`${this.apiVentas}/promociones`, request);
  }

  cambiarEstadoPromocion(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiVentas}/promociones/${id}/estado?activo=${activo}`, {});
  }

  validarCupon(request: ValidarCuponRequest): Observable<ValidarCuponResponse> {
    return this.http.post<ValidarCuponResponse>(`${this.apiVentas}/cupones/validar`, request);
  }

  // ==========================================
  // Ventas y POS
  // ==========================================
  listarVentas(sucursalId: number = 1): Observable<Venta[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<Venta[]>(this.apiVentas, { params });
  }

  obtenerVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiVentas}/${id}`);
  }

  registrarVenta(request: RegistrarVentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.apiVentas, request);
  }

  anularVenta(id: number, motivo: string): Observable<Venta> {
    const body: AnularVentaRequest = { motivo };
    return this.http.post<Venta>(`${this.apiVentas}/${id}/anular`, body);
  }

  // ==========================================
  // Ventas en Espera
  // ==========================================
  listarVentasEspera(): Observable<VentaEspera[]> {
    return this.http.get<VentaEspera[]>(`${this.apiVentas}/espera`);
  }

  guardarVentaEspera(request: GuardarVentaEsperaRequest): Observable<VentaEspera> {
    return this.http.post<VentaEspera>(`${this.apiVentas}/espera`, request);
  }

  eliminarVentaEspera(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiVentas}/espera/${id}`);
  }

  // ==========================================
  // Notas de Crédito y Devoluciones (SUNAT Tipo 07)
  // ==========================================
  listarNotasCredito(sucursalId: number = 1): Observable<NotaCredito[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<NotaCredito[]>(`${this.apiVentas}/notas-credito`, { params });
  }

  obtenerNotaCredito(id: number): Observable<NotaCredito> {
    return this.http.get<NotaCredito>(`${this.apiVentas}/notas-credito/${id}`);
  }

  emitirNotaCredito(request: EmitirNotaCreditoRequest): Observable<NotaCredito> {
    return this.http.post<NotaCredito>(`${this.apiVentas}/notas-credito`, request);
  }

  buscarComprobante(q: string): Observable<Venta> {
    const params = new HttpParams().set('q', q.trim());
    return this.http.get<Venta>(`${this.apiVentas}/buscar-comprobante`, { params });
  }
}
