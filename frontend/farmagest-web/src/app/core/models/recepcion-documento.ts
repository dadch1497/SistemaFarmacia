import { OrdenCompra } from './compras.models';

export interface FilaDocumento {
  descripcion: string;
  unidadDocumento?: string;
  codigo: string;
  productoId: number | null;
  cantidad: number | null;
  costo: number | null;
  lote: string;
  vencimiento: string;
  incluir: boolean;
  origen: string;
}
export interface DocumentoRecepcion {
  guia: string;
  factura: string;
  proveedor: string;
  ruc: string;
  filas: FilaDocumento[];
}
export interface LineaDocumento {
  texto: string;
  palabras?: { texto: string; x: number }[];
}
export interface ProductoDocumento { id: number; nombre: string; codigoBarras?: string; presentacion?: string; activo?: boolean; }
export interface RecepcionPreparada {
  archivo?: File;
  documento: DocumentoRecepcion;
  ordenId: number | null;
  productos: ProductoDocumento[];
  diferencias: string[];
}

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

// Ambiguous thousands/decimal separators are left for the reviewer, never guessed.
export function numeroDocumento(texto: string): number | null {
  const valor = texto.replace(/S\s*\/\s*\.?/gi, '').trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(valor)) return null;
  const numero = Number(valor.replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

export function fechaDocumento(texto: string): string {
  const iso = texto.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const local = texto.trim().match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  const valor = iso ? iso[0] : local ? `${local[3]}-${local[2]}-${local[1]}` : '';
  if (!valor) return '';
  const fecha = new Date(valor + 'T00:00:00Z');
  return Number.isFinite(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor ? valor : '';
}

type Columna = 'descripcion' | 'codigo' | 'cantidad' | 'costo' | 'lote' | 'vencimiento' | 'unidad' | 'ignorar';
function columna(texto: string): Columna | null {
  const n = normalizar(texto);
  if (/^(DESCRIPCION|DESCRIPCION DETALLADA|PRODUCTO|ARTICULO|MEDICAMENTO|DETALLE)$/.test(n)) return 'descripcion';
  if (/^(CODIGO|COD|EAN|SKU)$/.test(n)) return 'codigo';
  if (/^(CANTIDAD|CANT|CANT UND|UNIDADES)$/.test(n)) return 'cantidad';
  if (/^(COSTO|COSTO UNITARIO|C UNIT|P UNIT|PRECIO UNITARIO|PRECIO)$/.test(n)) return 'costo';
  if (/^(LOTE|N LOTE)$/.test(n)) return 'lote';
  if (/^(VENCIMIENTO|VENCE|VENC|F VENC|FECHA VENCIMIENTO)$/.test(n)) return 'vencimiento';
  if (/^(UNIDAD|UNIDAD DE MEDIDA|UM|U M)$/.test(n)) return 'unidad';
  if (/^(IMPORTE|TOTAL|SUBTOTAL|UM|U M|ITEM|NRO)$/.test(n)) return 'ignorar';
  return null;
}

export function filaVacia(): FilaDocumento {
  return { descripcion: '', codigo: '', productoId: null, cantidad: null, costo: null, lote: '', vencimiento: '', incluir: true, origen: '' };
}

/** Extract only explicit, headed columns. Unknown layouts remain editable source text. */
export function analizarDocumento(texto: string, lineas?: LineaDocumento[]): DocumentoRecepcion {
  const documento: DocumentoRecepcion = { guia: '', factura: '', proveedor: '', ruc: '', filas: [] };
  const guia = texto.match(/(?:GU[IÍ]A(?:\s+DE\s+REMISI[OÓ]N)?)[^\n]*?\b([A-Z0-9]{3,4}\s*-\s*\d{1,12})\b/i);
  const factura = texto.match(/FACTURA[^\n]*?\b([A-Z0-9]{3,4}\s*-\s*\d{1,12})\b/i);
  documento.guia = guia?.[1].replace(/\s/g, '') ?? texto.match(/\b(?:EG|T)[A-Z0-9]{2}\s*-\s*\d{1,12}\b/i)?.[0].replace(/\s/g, '') ?? '';
  documento.factura = factura?.[1].replace(/\s/g, '') ?? texto.match(/FACTURA[^\n]*?\b([EF][A-Z0-9]{3})\s+([0-9]{1,12})\b/i)?.slice(1, 3).join('-') ?? '';
  documento.proveedor = texto.match(/(?:PROVEEDOR|RAZ[OÓ]N\s+SOCIAL(?:\s+EMISOR)?)\s*:\s*([^\n]+)/i)?.[1].trim() ?? texto.match(/^([^\n:]{3,150}(?:S\.?A\.?C\.?|E\.?I\.?R\.?L\.?|S\.?R\.?L\.?))\s*$/im)?.[1].trim() ?? '';
  documento.ruc = texto.match(/RUC(?:\s+(?:DEL\s+)?(?:PROVEEDOR|EMISOR))?\s*(?:N[º°o.]?\s*)?[:.]?\s*(\d{11})\b/i)?.[1] ?? '';
  let cabecera: { tipo: Columna | null; x: number }[] = [];
  let delimitado = false;
  const origen: LineaDocumento[] = lineas ?? texto.split(/\r?\n/).map(texto => ({ texto }));
  for (const linea of origen) {
    if (!linea.texto.trim()) continue;
    const celdas = linea.texto.includes('|') ? linea.texto.split('|').map(t => t.trim()) : linea.texto.trim().split(/\t+|\s{2,}/);
    let nueva = celdas.map((texto, x) => ({ tipo: columna(texto), x }));
    let esDelimitado = true;
    if (!nueva.some(c => c.tipo === 'cantidad') || !nueva.some(c => c.tipo === 'descripcion' || c.tipo === 'codigo')) {
      nueva = (linea.palabras ?? []).map(p => ({ tipo: columna(p.texto), x: p.x })).filter(p => p.tipo !== null);
      esDelimitado = false;
    }
    if (nueva.some(c => c.tipo === 'cantidad') && nueva.some(c => c.tipo === 'descripcion' || c.tipo === 'codigo')) {
      cabecera = nueva; delimitado = esDelimitado; continue;
    }
    if (!cabecera.length) continue;
    if (/^(SUB\s*TOTAL|TOTAL|IGV|SON|OBSERVACIONES|CONDICIONES)\b/.test(normalizar(linea.texto))) { cabecera = []; continue; }
    const valores: Partial<Record<Columna, string>> = {};
    if (delimitado) {
      // A shifted/multiline row must be repaired by the reviewer instead of misassigning its numbers.
      if (celdas.length !== cabecera.length) continue;
      cabecera.forEach((c, i) => { if (c.tipo) valores[c.tipo] = celdas[i]; });
    } else {
      for (const palabra of linea.palabras ?? []) {
        const c = [...cabecera].reverse().find(c => palabra.x >= c.x - 12);
        if (c?.tipo) valores[c.tipo] = ((valores[c.tipo] ?? '') + ' ' + palabra.texto).trim();
      }
    }
    if (!valores.descripcion && !valores.codigo) continue;
    documento.filas.push({ ...filaVacia(), descripcion: valores.descripcion ?? '', codigo: valores.codigo ?? '',
      cantidad: numeroDocumento(valores.cantidad ?? ''), costo: numeroDocumento(valores.costo ?? ''),
      lote: valores.lote ?? '', unidadDocumento: valores.unidad ?? '', vencimiento: fechaDocumento(valores.vencimiento ?? ''), origen: linea.texto.trim() });
    if (documento.filas.length >= 150) break;
  }
  return documento;
}

export function vincularFilas(filas: FilaDocumento[], productos: ProductoDocumento[]): void {
  for (const fila of filas) {
    const activos = productos.filter(p => p.activo !== false);
    const porCodigo = fila.codigo ? activos.filter(p => p.codigoBarras === fila.codigo.trim()) : [];
    if (porCodigo.length) {
      fila.productoId = porCodigo.length === 1 ? porCodigo[0].id : null;
      continue;
    }
    // Supplier/internal codes may differ. Fall back only to an exact, unique product description.
    const nombre = normalizar(fila.descripcion);
    const porNombre = nombre ? activos.filter(p => normalizar(p.nombre) === nombre ||
      (!!p.presentacion && normalizar(p.nombre + ' ' + p.presentacion) === nombre)) : [];
    fila.productoId = porNombre.length === 1 ? porNombre[0].id : null;
  }
}

export function erroresFila(fila: FilaDocumento): string[] {
  const errores: string[] = [];
  if (!fila.productoId) errores.push('Vincula un producto');
  if (!Number.isInteger(fila.cantidad) || (fila.cantidad ?? 0) <= 0) errores.push('Cantidad entera mayor a cero');
  if (!Number.isFinite(fila.costo) || (fila.costo ?? 0) <= 0) errores.push('Completa el costo unitario');
  if (!fila.lote.trim() || fila.lote.length > 50) errores.push('Completa el lote (máx. 50 caracteres)');
  if (!fechaDocumento(fila.vencimiento)) errores.push('Completa una fecha de vencimiento válida');
  return errores;
}

export function compararDocumento(documento: DocumentoRecepcion, orden: OrdenCompra | null): string[] {
  if (!orden) return ['Sin orden vinculada: no se pueden contrastar cantidades, proveedor ni costos pactados.'];
  const diferencias: string[] = [];
  if (!documento.ruc) diferencias.push('RUC del emisor no identificado: verifica el proveedor en el documento.');
  else if (orden.proveedor?.ruc && documento.ruc !== orden.proveedor.ruc) diferencias.push('El RUC leído no coincide con el proveedor de la orden. Revisa si corresponde al emisor o al cliente.');
  const filas = documento.filas.filter(f => f.incluir && f.productoId);
  const ids = new Set([...orden.detalles.map(d => d.productoId), ...filas.map(f => f.productoId!)]);
  for (const id of ids) {
    const solicitados = orden.detalles.filter(d => d.productoId === id);
    const recibidos = filas.filter(f => f.productoId === id);
    const nombre = recibidos[0]?.descripcion || solicitados[0]?.nombreProducto || `Producto #${id}`;
    const pedido = solicitados.reduce((s, d) => s + d.cantidadSolicitada, 0);
    const recibido = recibidos.reduce((s, f) => s + (f.cantidad ?? 0), 0);
    if (!solicitados.length) diferencias.push(`${nombre}: no está en la orden de compra.`);
    else if (pedido !== recibido) diferencias.push(`${nombre}: solicitado ${pedido}, documento ${recibido} (${recibido < pedido ? 'faltan' : 'exceden'} ${Math.abs(pedido - recibido)}).`);
    if (recibidos.some(f => f.costo !== null && solicitados.length && !solicitados.some(d => Math.abs(d.costoPactado - f.costo!) < 0.005)))
      diferencias.push(`${nombre}: el costo unitario difiere del pactado. Verifica también si el documento incluye IGV.`);
  }
  return diferencias;
}
