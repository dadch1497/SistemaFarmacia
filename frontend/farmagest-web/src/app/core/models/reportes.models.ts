import { InjectionToken } from '@angular/core';

export interface VentasKpi {
  monto: number;
  variacionPorcentual?: number;
}

export interface UtilidadKpi {
  monto: number;
  margenPorcentual?: number;
}

export interface TicketPromedioKpi {
  monto: number;
  totalTransaccionesDia?: number;
}

export interface Kpis {
  ventasHoy: VentasKpi;
  ventasMes: VentasKpi;
  ventasAnio: VentasKpi;
  utilidadMes: UtilidadKpi;
  ticketPromedio: TicketPromedioKpi;
}

export interface ProductoRanking {
  rank: number;
  productoId: number;
  producto: string;
  unidades: number;
  monto: number;
}

export interface MedioPagoResumen {
  medioPago: 'EFECTIVO' | 'TARJETA' | 'YAPE_PLIN';
  porcentaje: number;
  total: number;
}

export interface VendedorResumen {
  usuarioId: number;
  vendedor: string;
  monto: number;
  totalVentas: number;
}

export interface DashboardData {
  periodo: string;
  kpis: Kpis;
  productosMasVendidos: ProductoRanking[];
  ventasPorMedioPago: MedioPagoResumen[];
  ventasPorVendedor: VendedorResumen[];
}

export interface VentaDiaSemana {
  dia: string;
  montoPromedio: number;
  esMayor: boolean;
}

export interface LogAuditoria {
  id: number;
  sucursalId: number;
  usuarioId: number;
  username: string;
  rol: string;
  accion: string;
  entidadAfectada: string;
  registroId: string;
  valorAnterior?: string;
  valorNuevo?: string;
  ipOrigen?: string;
  fechaHora: string;
}
