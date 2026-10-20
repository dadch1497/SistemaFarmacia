import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ReportesService } from '../../core/services/reportes.service';
import { DashboardData, VentaDiaSemana, LogAuditoria } from '../../core/models/reportes.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  periodoSeleccionado: string = 'mes';
  cargando = signal<boolean>(true);
  errorMensaje = signal<string | null>(null);

  dashboardData = signal<DashboardData | null>(null);
  ventasPorDia = signal<VentaDiaSemana[]>([]);
  bitacoraAuditoria = signal<LogAuditoria[]>([]);

  constructor(
    public authService: AuthService,
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.cargarDatosDashboard();
      this.cargarVentasPorDia();
      this.cargarAuditoria();
    } else {
      this.cargando.set(false);
    }
  }

  cargarDatosDashboard(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.reportesService.obtenerDashboard(this.periodoSeleccionado, 1).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.errorMensaje.set('No se pudo cargar la información analítica del dashboard');
        this.cargando.set(false);
      }
    });
  }

  cambiarPeriodo(periodo: string): void {
    this.periodoSeleccionado = periodo;
    this.cargarDatosDashboard();
  }

  cargarVentasPorDia(): void {
    this.reportesService.obtenerVentasPorDiaSemana(1).subscribe({
      next: (dias) => this.ventasPorDia.set(dias),
      error: (err) => console.error('Error cargando ventas por día:', err)
    });
  }

  cargarAuditoria(): void {
    this.reportesService.listarAuditoria(0, 10, 1).subscribe({
      next: (resp) => {
        if (resp && resp.content) {
          this.bitacoraAuditoria.set(resp.content);
        }
      },
      error: (err) => console.error('Error cargando auditoría:', err)
    });
  }

  getBarHeightPercentage(monto: number): number {
    const list = this.ventasPorDia();
    if (!list.length) return 0;
    const max = Math.max(...list.map(d => d.montoPromedio));
    if (max <= 0) return 0;
    return Math.round((monto / max) * 100);
  }

  formatActionBadge(accion: string): string {
    switch (accion) {
      case 'VENTA_ANULADA': return 'chip-critico';
      case 'CAMBIO_PRECIO': return 'chip-advertencia';
      case 'AJUSTE_STOCK': return 'chip-precaucion';
      case 'INGRESO_MERCADERIA': return 'chip-optimo';
      default: return 'chip-promo';
    }
  }
}
