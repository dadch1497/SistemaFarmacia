export interface StockProducto {
  id: number;
  productoId: number;
  sucursalId: number;
  stockActual: number;
  stockMinimo: number;
  stockMaximo?: number;
  estadoStock: 'OPTIMO' | 'BAJO' | 'CRITICO';
  actualizadoEn: string;
  // Enriquecido en UI con info del catálogo
  nombreProducto?: string;
  codigoBarras?: string;
  presentacion?: string;
}

export interface Lote {
  id: number;
  productoId: number;
  sucursalId: number;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadInicial: number;
  cantidadActual: number;
  costoUnitario?: number | null; // Nulo para vendedores
  estado: 'DISPONIBLE' | 'AGOTADO' | 'VENCIDO' | 'EN_CUARENTENA';
  diasRestantes: number;
  semaforoVencimiento: 'VERDE' | 'AMARILLO' | 'ROJO' | 'VENCIDO';
}

export interface MovimientoKardex {
  id: number;
  productoId: number;
  loteId?: number;
  numeroLote?: string;
  sucursalId: number;
  tipoMovimiento: 'INGRESO_COMPRA' | 'SALIDA_VENTA' | 'DEVOLUCION_CLIENTE' | 'AJUSTE_MERMA' | 'AJUSTE_SOBRANTE' | 'AJUSTE_VENCIMIENTO' | 'INGRESO_INICIAL';
  cantidad: number;
  saldoResultante: number;
  referenciaTipo?: string;
  referenciaId?: string;
  motivo?: string;
  usuarioId: number;
  fechaHora: string;
}

export interface AlertaInventario {
  id: number;
  productoId: number;
  loteId?: number;
  numeroLote?: string;
  sucursalId: number;
  tipoAlerta: 'STOCK_MINIMO' | 'VENCIMIENTO_30_DIAS' | 'VENCIMIENTO_60_DIAS' | 'VENCIMIENTO_90_DIAS' | 'VENCIDO';
  mensaje: string;
  nivelUrgencia: number; // 1: Info, 2: Advertencia, 3: Crítico
  atendida: boolean;
  fechaAlerta: string;
}

export interface AjusteStockRequest {
  productoId: number;
  loteId: number;
  sucursalId?: number;
  tipoAjuste: 'AJUSTE_MERMA' | 'AJUSTE_SOBRANTE' | 'AJUSTE_VENCIMIENTO';
  cantidad: number;
  motivo: string;
}
