export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Laboratorio {
  id: number;
  nombre: string;
  paisOrigen?: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  principioActivo?: string;
  concentracion?: string;
  presentacion: string;
  categoria: Categoria;
  laboratorio: Laboratorio;
  precioVenta: number;
  precioCosto?: number | null; // Nulo para vendedores
  margenPorcentaje?: number | null; // Nulo para vendedores
  requiereReceta: boolean;
  activo: boolean;
  creadoEn: string;
}

export interface HistorialPrecio {
  id: number;
  productoId: number;
  nombreProducto: string;
  precioAnterior: number;
  precioNuevo: number;
  costoAnterior: number;
  costoNuevo: number;
  motivo: string;
  usuarioId: number;
  fechaCambio: string;
}

export interface CrearProductoRequest {
  codigoBarras: string;
  nombre: string;
  principioActivo?: string;
  concentracion?: string;
  presentacion: string;
  categoriaId: number;
  laboratorioId: number;
  precioVenta: number;
  precioCosto: number;
  requiereReceta: boolean;
}

export interface ActualizarProductoRequest {
  nombre: string;
  principioActivo?: string;
  concentracion?: string;
  presentacion: string;
  categoriaId: number;
  laboratorioId: number;
  precioVenta: number;
  precioCosto: number;
  requiereReceta?: boolean;
  activo?: boolean;
  motivoCambio?: string;
}

export interface CambiarPrecioRequest {
  nuevoPrecioVenta: number;
  nuevoPrecioCosto?: number;
  motivo: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
