export type EstadoSesionCaja = 'ABIERTA' | 'CERRADA' | 'ARQUEADA';
export type TipoDocumento = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE' | 'SIN_DOCUMENTO';
export type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA_VENTA';
export type MedioPago = 'EFECTIVO' | 'TARJETA' | 'YAPE_PLIN' | 'CREDITO';
export type EstadoVenta = 'COMPLETADA' | 'ANULADA' | 'CON_NOTA_CREDITO';

export interface Caja {
  id: number;
  sucursalId: number;
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface SesionCaja {
  id: number;
  cajaId: number;
  nombreCaja: string;
  codigoCaja: string;
  usuarioId: number;
  sucursalId: number;
  montoApertura: number;
  montoCierreSistema?: number;
  montoCierreReal?: number;
  diferencia?: number;
  estado: EstadoSesionCaja;
  fechaApertura: string;
  fechaCierre?: string;
  observaciones?: string;
  totalVentasEfectivo?: number;
  totalVentasTarjeta?: number;
  totalVentasBilletera?: number;
  totalVentasGeneral?: number;
  cantidadTransacciones?: number;
}

export interface AperturaCajaRequest {
  cajaId: number;
  sucursalId?: number;
  montoApertura: number;
  observaciones?: string;
}

export interface CierreCajaRequest {
  montoCierreReal: number;
  observaciones?: string;
}

export interface Cliente {
  id: number;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombresORazonSocial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  limiteCredito?: number;
  saldoDeudor?: number;
  diasCredito?: number;
}

export interface CrearClienteRequest {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombresORazonSocial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface Promocion {
  id: number;
  nombre: string;
  tipoAlcance: 'POR_PRODUCTO' | 'POR_CATEGORIA' | 'POR_MONTO_TOTAL' | 'POR_VENCIMIENTO_PROXIMO';
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO' | 'N_X_M';
  valorDescuento?: number;
  cantidadCondicion?: number;
  cantidadPagada?: number;
  fechaInicio: string;
  fechaFin: string;
  aplicaPorVencimiento: boolean;
  activo: boolean;
}

export interface CrearPromocionForm {
  nombre: string;
  tipoAlcance: 'POR_PRODUCTO' | 'POR_CATEGORIA' | 'POR_MONTO_TOTAL' | 'POR_VENCIMIENTO_PROXIMO';
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO' | 'N_X_M';
  valorDescuento?: number;
  cantidadCondicion?: number;
  cantidadPagada?: number;
  fechaInicio: string;
  fechaFin: string;
  aplicaPorVencimiento: boolean;
}

export interface ValidarCuponRequest {
  codigo: string;
  montoVenta: number;
  productosIds?: number[];
}

export interface ValidarCuponResponse {
  valido: boolean;
  cuponId?: number;
  codigo?: string;
  mensaje: string;
  porcentajeDescuento?: number;
  montoDescuentoCalculado?: number;
  nuevoTotal?: number;
}

export interface ItemVentaRequest {
  productoId: number;
  loteId?: number;
  numeroLote?: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario?: number;
  descuento?: number;
}

export interface RegistrarVentaRequest {
  sucursalId?: number;
  sesionCajaId?: number;
  clienteId?: number;
  clienteTipoDocumento?: string;
  clienteNumeroDocumento?: string;
  clienteNombre?: string;
  clienteDireccion?: string;
  tipoComprobante: TipoComprobante;
  medioPago: MedioPago;
  montoRecibido?: number;
  promocionId?: number;
  cuponId?: number;
  cuponCodigo?: string;
  descuentoManual?: number;
  observaciones?: string;
  items: ItemVentaRequest[];
}

export interface DetalleVenta {
  id: number;
  productoId: number;
  nombreProducto?: string;
  loteId?: number;
  numeroLote?: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  descuentoLinea: number;
  subtotalLinea: number;
}

export interface Venta {
  id: number;
  sucursalId: number;
  sesionCajaId: number;
  cliente?: Cliente;
  usuarioVendedorId: number;
  nombreVendedor?: string;
  tipoComprobante: TipoComprobante;
  serieComprobante: string;
  numeroComprobante: string;
  subtotal: number;
  montoDescuento: number;
  igv: number;
  total: number;
  medioPago: MedioPago;
  montoRecibido?: number;
  vuelto?: number;
  promocionId?: number;
  promocionNombre?: string;
  cuponId?: number;
  cuponCodigo?: string;
  estado: EstadoVenta;
  fechaHora: string;
  observaciones?: string;
  hashCpe?: string;
  qrCodeUrl?: string;
  estadoSunat?: string;
  mensajeSunat?: string;
  notaCreditoReferencia?: string;
  detalles: DetalleVenta[];
}

export interface VentaEspera {
  id: number;
  usuarioId: number;
  sucursalId: number;
  codigoEspera: string;
  nombreReferencia: string;
  datosJson: string;
  fechaHora: string;
}

export interface GuardarVentaEsperaRequest {
  nombreReferencia?: string;
  datosJson: string;
}

export interface AnularVentaRequest {
  motivo: string;
}

export interface AmortizarDeudaRequest {
  monto: number;
  medioPago: MedioPago;
  referencia?: string;
}

// ==========================================
// NOTAS DE CRÉDITO ELECTRÓNICAS (SUNAT TIPO 07)
// ==========================================
export type TipoNotaCredito =
  | '01' // Anulación de la operación
  | '02' // Anulación por error en el RUC
  | '03' // Corrección por error en la descripción
  | '04' // Descuento global
  | '05' // Descuento por ítem
  | '06' // Devolución total
  | '07'; // Devolución por ítem (parcial)

export interface DetalleNotaCredito {
  id?: number;
  detalleVentaId?: number;
  productoId: number;
  nombreProducto: string;
  loteId?: number;
  numeroLote?: string;
  cantidadDevuelta: number;
  precioUnitario: number;
  subtotal: number;
  reingresaAStock: boolean;
  motivoItem?: string;
}

export interface NotaCredito {
  id: number;
  sucursalId: number;
  sesionCajaId?: number;
  ventaId: number;
  tipoComprobanteModificado: TipoComprobante;
  serieComprobanteModificado: string;
  numeroComprobanteModificado: string;
  serieNotaCredito: string;
  numeroNotaCredito: string;
  tipoNotaCredito: TipoNotaCredito;
  descripcionTipoNotaCredito: string;
  motivoSustento: string;
  cliente?: Cliente;
  fechaHora: string;
  subtotalDevuelto: number;
  igvDevuelto: number;
  totalDevuelto: number;
  medioReembolso: MedioPago;
  reingresoStockRealizado: boolean;
  hashCpe: string;
  qrCodeUrl: string;
  estadoSunat: string;
  detalles: DetalleNotaCredito[];
}

export interface ItemDevolucionRequest {
  detalleVentaId?: number;
  productoId: number;
  nombreProducto?: string;
  loteId?: number;
  numeroLote?: string;
  cantidadDevuelta: number;
  precioUnitario: number;
  reingresaAStock: boolean;
  motivoItem?: string;
}

export interface EmitirNotaCreditoRequest {
  ventaId: number;
  tipoNotaCredito: TipoNotaCredito;
  motivoSustento: string;
  medioReembolso?: MedioPago;
  items: ItemDevolucionRequest[];
}


export interface SireEstado {
  conectado: boolean;
  ambiente: string;
  ruc: string;
  razonSocial: string;
  usuarioSol: string;
  tokenValido: boolean;
  tokenType: string;
  expiresIn: number;
  ultimaSincronizacion: string;
  mensaje?: string;
}

export interface ComprobanteSire {
  periodo: string;
  fechaEmision: string;
  fechaVcto: string;
  tipoComprobante: string;
  tipoComprobanteTexto?: string;
  serie: string;
  numero: string;
  numeroFinal?: string;
  tipoDocIdentidad: string;
  numDocIdentidad: string;
  razonSocial: string;
  valorExportacion: number;
  biGravada: number;
  descuentoBi: number;
  igv: number;
  descuentoIgv: number;
  montoExonerado: number;
  montoInafecto: number;
  isc: number;
  biIvap: number;
  ivap: number;
  icbper: number;
  otrosTributos: number;
  total: number;
  moneda: string;
  tipoCambio: number;
  fechaDocModificado?: string;
  tipoCpModificado?: string;
  serieCpModificado?: string;
  nroCpModificado?: string;
  car: string;
  estado: string;
}

export interface SirePropuestaResponse {
  periodo: string;
  rucEmisor: string;
  razonSocial: string;
  nombreComercial: string;
  conectadoSunat: boolean;
  resumen: {
    totalComprobantes: number;
    totalGravado: number;
    totalIgv: number;
    totalImporte: number;
  };
  comprobantes: ComprobanteSire[];
}
