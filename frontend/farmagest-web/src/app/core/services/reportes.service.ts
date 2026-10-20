import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData, VentaDiaSemana, LogAuditoria } from '../models/reportes.models';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private readonly API_URL = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) {}

  obtenerDashboard(periodo: string = 'mes', sucursalId: number = 1): Observable<DashboardData> {
    const params = new HttpParams()
      .set('periodo', periodo)
      .set('sucursalId', sucursalId.toString());
    return this.http.get<DashboardData>(`${this.API_URL}/dashboard`, { params });
  }

  obtenerVentasPorDiaSemana(sucursalId: number = 1): Observable<VentaDiaSemana[]> {
    const params = new HttpParams().set('sucursalId', sucursalId.toString());
    return this.http.get<VentaDiaSemana[]>(`${this.API_URL}/ventas/por-dia-semana`, { params });
  }

  listarAuditoria(page: number = 0, size: number = 20, sucursalId: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sucursalId', sucursalId.toString());
    return this.http.get<any>(`${this.API_URL}/auditoria`, { params });
  }
}
