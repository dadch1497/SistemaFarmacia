import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReportesService } from '../../core/services/reportes.service';
import { VentasService } from '../../core/services/ventas.service';
import { DashboardData, VentaDiaSemana, LogAuditoria } from '../../core/models/reportes.models';
import { Venta, SesionCaja } from '../../core/models/ventas.models';

export interface VentaDiaVendedor {
  dia: string;
  fecha: string;
  monto: number;
  cantidad: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  periodoSeleccionado: string = 'mes';
  cargando = signal<boolean>(true);
  errorMensaje = signal<string | null>(null);

  // Datos Administrador
  dashboardData = signal<DashboardData | null>(null);
  ventasPorDia = signal<VentaDiaSemana[]>([]);
  bitacoraAuditoria = signal<LogAuditoria[]>([]);

  // Datos Vendedor
  misVentas = signal<Venta[]>([]);
  miTurnoCaja = signal<SesionCaja | null>(null);
  filtroBusquedaVenta: string = '';

  totalAcumuladoVendedor = signal<number>(0);
  cantidadTotalVentasVendedor = signal<number>(0);
  totalHoyVendedor = signal<number>(0);
  cantidadHoyVendedor = signal<number>(0);
  ticketPromedioVendedor = signal<number>(0);

  ventasEfectivoVendedor = signal<number>(0);
  ventasTarjetaVendedor = signal<number>(0);
  ventasYapeVendedor = signal<number>(0);

  cantidadBoletasVendedor = signal<number>(0);
  totalBoletasVendedor = signal<number>(0);
  cantidadFacturasVendedor = signal<number>(0);
  totalFacturasVendedor = signal<number>(0);

  ventasUltimos7DiasVendedor = signal<VentaDiaVendedor[]>([]);

  constructor(
    public authService: AuthService,
    private reportesService: ReportesService,
    private ventasService: VentasService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.cargarDatosDashboard();
      this.cargarVentasPorDia();
      this.cargarAuditoria();
    } else if (this.authService.isVendedor()) {
      this.cargarDatosVendedor();
    } else {
      this.cargando.set(false);
    }
  }

  actualizarDatos(): void {
    if (this.authService.isAdmin()) {
      this.cargarDatosDashboard();
      this.cargarVentasPorDia();
      this.cargarAuditoria();
    } else if (this.authService.isVendedor()) {
      this.cargarDatosVendedor();
    }
  }

  // ==========================================
  // Métricas del Administrador
  // ==========================================
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

  // ==========================================
  // Métricas y Reportes del Vendedor
  // ==========================================
  cargarDatosVendedor(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    // 1. Consultar estado del turno de caja del vendedor
    this.ventasService.obtenerMiTurno(1).subscribe({
      next: (turno) => this.miTurnoCaja.set(turno),
      error: () => this.miTurnoCaja.set(null)
    });

    // 2. Consultar ventas acumuladas del vendedor (filtradas automáticamente por su token en backend)
    this.ventasService.listarVentas(1).subscribe({
      next: (ventas) => {
        const completadas = ventas.filter(v => v.estado === 'COMPLETADA');
        this.misVentas.set(completadas);

        let totalAcumulado = 0;
        let efectivo = 0;
        let tarjeta = 0;
        let yape = 0;
        let boletasCant = 0;
        let boletasTotal = 0;
        let facturasCant = 0;
        let facturasTotal = 0;

        const hoy = new Date();
        const hoyYear = hoy.getFullYear();
        const hoyMonth = hoy.getMonth();
        const hoyDate = hoy.getDate();

        let hoyMonto = 0;
        let hoyCantidad = 0;

        // Estructura para últimos 7 días
        const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const ultimos7DiasMap = new Map<string, { dia: string, fecha: string, monto: number, cantidad: number }>();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const fKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const nombreDia = diasSemanaNombres[d.getDay()];
          ultimos7DiasMap.set(fKey, { dia: nombreDia, fecha: `${d.getDate()}/${d.getMonth() + 1}`, monto: 0, cantidad: 0 });
        }

        for (const v of completadas) {
          const tot = Number(v.total) || 0;
          totalAcumulado += tot;

          if (v.medioPago === 'EFECTIVO') efectivo += tot;
          else if (v.medioPago === 'TARJETA') tarjeta += tot;
          else if (v.medioPago === 'YAPE_PLIN') yape += tot;

          if (v.tipoComprobante === 'BOLETA') {
            boletasCant++;
            boletasTotal += tot;
          } else if (v.tipoComprobante === 'FACTURA') {
            facturasCant++;
            facturasTotal += tot;
          }

          if (v.fechaHora) {
            const vDate = new Date(v.fechaHora);
            if (vDate.getFullYear() === hoyYear && vDate.getMonth() === hoyMonth && vDate.getDate() === hoyDate) {
              hoyMonto += tot;
              hoyCantidad++;
            }

            const fKey = `${vDate.getFullYear()}-${String(vDate.getMonth() + 1).padStart(2, '0')}-${String(vDate.getDate()).padStart(2, '0')}`;
            if (ultimos7DiasMap.has(fKey)) {
              const item = ultimos7DiasMap.get(fKey)!;
              item.monto += tot;
              item.cantidad++;
            }
          }
        }

        this.totalAcumuladoVendedor.set(Number(totalAcumulado.toFixed(2)));
        this.cantidadTotalVentasVendedor.set(completadas.length);
        this.totalHoyVendedor.set(Number(hoyMonto.toFixed(2)));
        this.cantidadHoyVendedor.set(hoyCantidad);
        this.ticketPromedioVendedor.set(
          completadas.length > 0 ? Number((totalAcumulado / completadas.length).toFixed(2)) : 0
        );

        this.ventasEfectivoVendedor.set(Number(efectivo.toFixed(2)));
        this.ventasTarjetaVendedor.set(Number(tarjeta.toFixed(2)));
        this.ventasYapeVendedor.set(Number(yape.toFixed(2)));

        this.cantidadBoletasVendedor.set(boletasCant);
        this.totalBoletasVendedor.set(Number(boletasTotal.toFixed(2)));
        this.cantidadFacturasVendedor.set(facturasCant);
        this.totalFacturasVendedor.set(Number(facturasTotal.toFixed(2)));

        this.ventasUltimos7DiasVendedor.set(Array.from(ultimos7DiasMap.values()));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando ventas del vendedor:', err);
        this.errorMensaje.set('No se pudieron calcular las estadísticas del vendedor');
        this.cargando.set(false);
      }
    });
  }

  getBarHeightPercentageVendedor(monto: number): number {
    const list = this.ventasUltimos7DiasVendedor();
    if (!list.length) return 0;
    const max = Math.max(...list.map(d => d.monto));
    if (max <= 0) return 0;
    return Math.round((monto / max) * 100);
  }

  obtenerMisVentasFiltradas(): Venta[] {
    const txt = (this.filtroBusquedaVenta || '').toLowerCase().trim();
    if (!txt) return this.misVentas().slice(0, 15);

    return this.misVentas().filter(v => {
      const comprobante = `${v.serieComprobante}-${v.numeroComprobante}`.toLowerCase();
      const clienteNom = (v.cliente?.nombresORazonSocial || '').toLowerCase();
      const clienteDoc = (v.cliente?.numeroDocumento || '').toLowerCase();
      const medio = (v.medioPago || '').toLowerCase();
      return comprobante.includes(txt) || clienteNom.includes(txt) || clienteDoc.includes(txt) || medio.includes(txt);
    }).slice(0, 20);
  }
}
