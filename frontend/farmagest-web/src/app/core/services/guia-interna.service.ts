import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CatalogoService } from './catalogo.service';
import { ComprasService } from './compras.service';
import { IngresoMercaderia, OrdenCompra } from '../models/compras.models';
import { Producto } from '../models/catalogo.models';

export interface DatosGuiaInterna {
  codigo: string;
  modo: 'ESPERADA' | 'RECIBIDA';
  referencia: string;
  fecha: string;
  estado: string;
  sucursal: number;
  proveedor: string;
  ruc: string;
  direccion: string;
  factura: string;
  observaciones: string;
  filas: { producto: string; codigo: string; presentacion: string; cantidad: number; costo: number; lote: string; vencimiento: string }[];
  subtotal?: number;
  igv?: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class GuiaInternaService {
  constructor(private compras: ComprasService, private catalogo: CatalogoService) {}

  async obtener(ordenId?: number | null, ingresoId?: number | null): Promise<File> {
    if (ordenId) {
      const orden = await firstValueFrom(this.compras.obtenerOrden(ordenId));
      this.validarOrden(orden);
      const productos = await this.productos(orden.detalles.map(d => d.productoId));
      return this.generar(this.datosOrden(orden, productos));
    }
    if (!ingresoId) throw new Error('Selecciona una compra o una recepción.');
    const ingreso = await firstValueFrom(this.compras.obtenerIngreso(ingresoId));
    const productos = await this.productos(ingreso.detalles.map(d => d.productoId));
    return this.generar(this.datosIngreso(ingreso, productos));
  }

  private async productos(ids: number[]): Promise<Producto[]> {
    const unicos = [...new Set(ids)]; const productos: Producto[] = [];
    // Fetch by identity, including products outside the initial catalog page.
    for (let i = 0; i < unicos.length; i += 4) {
      productos.push(...await Promise.all(unicos.slice(i, i + 4).map(id => firstValueFrom(this.catalogo.obtenerProductoPorId(id)))));
    }
    return productos;
  }
  validarOrden(orden: OrdenCompra): void {
    if (!['APROBADA', 'EN_TRANSITO', 'RECIBIDA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL'].includes(orden.estado))
      throw new Error('La guía interna estará disponible cuando el administrador apruebe la compra.');
  }
  datosOrden(orden: OrdenCompra, productos: Producto[]): DatosGuiaInterna {
    this.validarOrden(orden);
    return {
      codigo: `GI-${orden.numeroOrden}`, modo: 'ESPERADA', referencia: orden.numeroOrden,
      fecha: orden.fechaEmision, estado: orden.estado, sucursal: orden.sucursalId,
      proveedor: orden.proveedor?.razonSocial || 'No registrado en la compra', ruc: orden.proveedor?.ruc || 'No registrado',
      direccion: orden.proveedor?.direccion || 'No registrada', factura: '', observaciones: orden.observaciones || '',
      filas: orden.detalles.map(d => {
        const p = productos.find(p => p.id === d.productoId);
        if (!p) throw new Error('No se pudo recuperar la ficha de uno de los productos. Reintenta la generación.');
        return { producto: p.nombre, codigo: p.codigoBarras, presentacion: p.presentacion,
          cantidad: d.cantidadSolicitada, costo: d.costoPactado, lote: '', vencimiento: '' };
      }), subtotal: orden.subtotal, igv: orden.igv, total: orden.total
    };
  }
  datosIngreso(ingreso: IngresoMercaderia, productos: Producto[]): DatosGuiaInterna {
    return {
      codigo: `GI-ING-${ingreso.id}`, modo: 'RECIBIDA', referencia: ingreso.numeroGuia, fecha: ingreso.fechaRecepcion,
      estado: 'INGRESO REGISTRADO', sucursal: ingreso.sucursalId, proveedor: 'Sin compra asociada: proveedor no registrado',
      ruc: 'No registrado', direccion: 'No registrada', factura: ingreso.numeroFacturaProveedor || 'No registrada',
      observaciones: ingreso.observaciones || '',
      filas: ingreso.detalles.map(d => {
        const p = productos.find(p => p.id === d.productoId);
        if (!p) throw new Error('No se pudo recuperar la ficha de uno de los productos. Reintenta la generación.');
        return { producto: p.nombre, codigo: p.codigoBarras, presentacion: p.presentacion,
          cantidad: d.cantidadRecibida, costo: d.costoUnitarioReal, lote: d.numeroLote, vencimiento: d.fechaVencimiento };
      }), total: ingreso.detalles.reduce((s, d) => s + d.cantidadRecibida * d.costoUnitarioReal, 0)
    };
  }

  async generar(datos: DatosGuiaInterna): Promise<File> {
    if (!datos.filas.length) throw new Error('El documento no tiene productos para mostrar.');
    const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    // Built-in WinAnsi fonts cover Spanish; unsupported glyphs are made explicit.
    const texto = (valor: unknown) => String(valor ?? '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/[^\x20-\x7e\xa0-\xff\n]/g, '?');
    const dinero = (n: number) => `S/ ${Number(n).toFixed(2)}`;
    const fecha = (valor: string) => {
      const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})/); return match ? `${match[3]}/${match[2]}/${match[1]}` : 'No registrada';
    };
    doc.setProperties({ title: texto(`Guía interna ${datos.codigo}`), author: 'FarmaGest', subject: 'Documento interno para cotejo de mercadería' });
    const header = () => {
      doc.setFillColor(15, 79, 70); doc.roundedRect(12, 13, 10, 10, 2, 2, 'F');
      doc.setDrawColor(255); doc.setLineWidth(0.8); doc.line(15, 18, 19, 18); doc.line(17, 16, 17, 20);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 79, 70); doc.setFontSize(17); doc.text('FarmaGest', 25, 19);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(70, 90, 80); doc.text('Botica Farma Ochenta', 25, 25);
      doc.setDrawColor(15, 79, 70); doc.setLineWidth(0.4); doc.roundedRect(117, 12, 81, 29, 2, 2);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('GUÍA INTERNA DE RECEPCIÓN', 157.5, 19, { align: 'center' });
      doc.setFontSize(9); doc.text(texto(datos.codigo), 157.5, 25, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); doc.text(datos.modo === 'ESPERADA' ? 'HOJA DE COTEJO DE COMPRA' : 'CONSTANCIA DE INGRESO REGISTRADO', 157.5, 31, { align: 'center' });
      doc.text('DOCUMENTO INTERNO - NO ES GUÍA SUNAT', 157.5, 36, { align: 'center' });
      doc.setDrawColor(200, 214, 207); doc.line(12, 45, 198, 45);
    };
    header();
    autoTable(doc, {
      startY: 50, margin: { left: 12, right: 12, top: 50, bottom: 18 }, theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [35, 55, 45], overflow: 'linebreak' },
      body: [
        [`${datos.modo === 'ESPERADA' ? 'COMPRA' : 'GUÍA DEL PROVEEDOR'}: ${texto(datos.referencia)}`, `FECHA DEL REGISTRO: ${fecha(datos.fecha)}`],
        [`PROVEEDOR: ${texto(datos.proveedor)}`, `RUC PROVEEDOR: ${texto(datos.ruc)}`],
        [`DIRECCIÓN: ${texto(datos.direccion)}`, `DESTINO: Botica Farma Ochenta / Sucursal ${datos.sucursal}`],
        [`ESTADO: ${texto(datos.estado)}`, datos.modo === 'ESPERADA' ? 'FECHA DE ENTREGA REAL: __________________' : `FACTURA: ${texto(datos.factura)}`]
      ], columnStyles: { 0: { cellWidth: 113 }, 1: { cellWidth: 73 } },
      alternateRowStyles: { fillColor: [246, 249, 247] }
    });
    let y = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(15, 79, 70);
    doc.text(datos.modo === 'ESPERADA' ? 'PRODUCTOS ESPERADOS - COMPLETAR EL COTEJO AL RECIBIR' : 'PRODUCTOS Y LOTES RECIBIDOS', 12, y);
    autoTable(doc, {
      startY: y + 4, margin: { left: 12, right: 12, top: 50, bottom: 18 }, theme: 'grid',
      head: [[ '#', 'Producto / código', 'Presentación', datos.modo === 'ESPERADA' ? 'Cant.\npedida' : 'Cant.\nrecibida', 'Recibido\nfísico', 'Costo\nunitario', 'Nº lote', 'Vencimiento' ]],
      body: datos.filas.map((f, i) => [i + 1, texto(`${f.producto}\nCódigo: ${f.codigo}`), texto(f.presentacion), f.cantidad,
        datos.modo === 'ESPERADA' ? '' : f.cantidad, dinero(f.costo), texto(f.lote), f.vencimiento ? fecha(f.vencimiento) : '' ]),
      styles: { font: 'helvetica', fontSize: 7.3, cellPadding: 2.3, minCellHeight: 15, lineColor: [210, 220, 214], lineWidth: 0.15, overflow: 'linebreak', valign: 'middle', textColor: [25, 45, 35] },
      headStyles: { fillColor: [15, 79, 70], textColor: 255, fontStyle: 'bold', minCellHeight: 12 },
      alternateRowStyles: { fillColor: [247, 250, 248] },
      columnStyles: { 0: { cellWidth: 7, cellPadding: 1, halign: 'center' }, 1: { cellWidth: 46 }, 2: { cellWidth: 25 }, 3: { cellWidth: 15, halign: 'right' }, 4: { cellWidth: 17 }, 5: { cellWidth: 20, halign: 'right' }, 6: { cellWidth: 27 }, 7: { cellWidth: 29 } },
      rowPageBreak: 'avoid', didDrawPage: data => { if (data.pageNumber > 1) header(); }
    });
    y = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    if (y + 81 > 276) { doc.addPage(); header(); y = 53; }
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 70, 60);
    const resumen = datos.modo === 'ESPERADA'
      ? `Importes de la compra: Subtotal ${dinero(datos.subtotal ?? 0)}  |  IGV ${dinero(datos.igv ?? 0)}  |  Total ${dinero(datos.total)}`
      : `Valor de productos recibidos: ${dinero(datos.total)}. No se calcula un IGV adicional.`;
    doc.text(resumen, 12, y); y += 8;
    const observaciones = doc.splitTextToSize(`Observaciones del registro: ${texto(datos.observaciones || 'Sin observaciones')}`, 180);
    // Allow long observations to continue without truncating them.
    for (const linea of observaciones) {
      if (y > 245) { doc.addPage(); header(); y = 53; }
      doc.text(linea, 12, y); y += 4;
    }
    if (y + 57 > 276) { doc.addPage(); header(); y = 53; }
    doc.setDrawColor(175, 193, 182); doc.roundedRect(12, y + 3, 186, 21, 1, 1);
    doc.setFont('helvetica', 'bold'); doc.text('Diferencias / observaciones al recibir:', 15, y + 9);
    doc.setFont('helvetica', 'normal'); doc.text('_________________________________________________________________________________________', 15, y + 18);
    y += 37;
    doc.line(18, y, 92, y); doc.line(118, y, 192, y);
    doc.text('Entrega: nombre y firma', 55, y + 5, { align: 'center' }); doc.text('Almacén: nombre, firma y fecha', 155, y + 5, { align: 'center' });
    const paginas = doc.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 105, 95);
      doc.text('Documento generado a partir del registro guardado. No acredita entrega ni modifica el inventario.', 12, 284);
      doc.text(`Página ${i} de ${paginas}`, 198, 289, { align: 'right' });
    }
    return new File([doc.output('arraybuffer')], `${datos.codigo.replace(/[^A-Za-z0-9_-]/g, '_')}.pdf`, { type: 'application/pdf' });
  }
}
