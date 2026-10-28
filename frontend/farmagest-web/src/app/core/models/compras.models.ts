export type EstadoOrden = 'PENDIENTE' | 'APROBADA' | 'EN_TRANSITO' | 'RECIBIDA' | 'RECIBIDA_PARCIAL' | 'RECIBIDA_TOTAL' | 'CANCELADA';

export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean;
}

export interface CrearProveedorRequest {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface DetalleOrdenDto {
  id?: number;
  productoId: number;
  nombreProducto?: string;
  cantidadSolicitada: number;
  costoPactado: number;
  subtotal: number;
}

export interface OrdenCompra {
  id: number;
  numeroOrden: string;
  proveedor?: Proveedor;
  sucursalId: number;
  estado: EstadoOrden;
  subtotal: number;
  igv: number;
  total: number;
  usuarioCreadorId?: number;
  fechaEmision: string;
  fechaEsperada?: string;
  observaciones?: string;
  detalles: DetalleOrdenDto[];
}

export interface ItemOrdenRequest {
  productoId: number;
  cantidadSolicitada: number;
  costoPactado: number;
}

export interface CrearOrdenCompraRequest {
  proveedorId: number;
  sucursalId?: number;
  fechaEsperada?: string;
  observaciones?: string;
  items: ItemOrdenRequest[];
}

export interface DetalleIngresoDto {
  id?: number;
  productoId: number;
  nombreProducto?: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadRecibida: number;
  costoUnitarioReal: number;
}

export interface IngresoMercaderia {
  tieneGuiaAdjunta?: boolean;
  id: number;
  numeroGuia: string;
  numeroFacturaProveedor?: string;
  ordenCompraId?: number;
  numeroOrdenCompra?: string;
  sucursalId: number;
  usuarioRecepcionId?: number;
  fechaRecepcion: string;
  observaciones?: string;
  detalles: DetalleIngresoDto[];
}

export interface ItemIngresoRequest {
  productoId: number;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadRecibida: number;
  costoUnitarioReal: number;
}

export interface RegistrarIngresoRequest {
  numeroGuia: string;
  numeroFacturaProveedor?: string;
  ordenCompraId?: number | null;
  sucursalId?: number;
  observaciones?: string;
  items: ItemIngresoRequest[];
}
