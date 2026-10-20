import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../core/services/ventas.service';
import { Venta } from '../../core/models/ventas.models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  ventas = signal<Venta[]>([]);
  cargando = signal<boolean>(true);
  errorMensaje = signal<string | null>(null);

  // Filtros
  filtroComprobante: string = 'TODOS';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  busquedaTexto: string = '';

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.ventasService.listarVentas(1).subscribe({
      next: (data) => {
        this.ventas.set(data || []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar ventas para reportes:', err);
        this.errorMensaje.set('No se pudo conectar con el servicio de ventas.');
        this.cargando.set(false);
      }
    });
  }

  ventasFiltradas(): Venta[] {
    return this.ventas().filter(v => {
      // Filtro tipo comprobante
      if (this.filtroComprobante !== 'TODOS' && v.tipoComprobante !== this.filtroComprobante) {
        return false;
      }

      // Filtro de fechas (formato YYYY-MM-DD)
      if (this.filtroFechaDesde && v.fechaHora) {
        const fDesde = this.filtroFechaDesde;
        const fVenta = v.fechaHora.substring(0, 10);
        if (fVenta < fDesde) return false;
      }
      if (this.filtroFechaHasta && v.fechaHora) {
        const fHasta = this.filtroFechaHasta;
        const fVenta = v.fechaHora.substring(0, 10);
        if (fVenta > fHasta) return false;
      }

      // Búsqueda por texto (serie, número, cliente, documento)
      if (this.busquedaTexto.trim()) {
        const q = this.busquedaTexto.trim().toLowerCase();
        const serieNum = `${v.serieComprobante}-${v.numeroComprobante}`.toLowerCase();
        const docCli = (v.cliente?.numeroDocumento || '').toLowerCase();
        const nomCli = (v.cliente?.nombresORazonSocial || '').toLowerCase();
        if (!serieNum.includes(q) && !docCli.includes(q) && !nomCli.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }

  // Totales acumulados de la vista actual
  totalOperacionesGravadas(): number {
    return Number(this.ventasFiltradas().reduce((sum, v) => sum + (v.subtotal || 0), 0).toFixed(2));
  }

  totalIgv(): number {
    return Number(this.ventasFiltradas().reduce((sum, v) => sum + (v.igv || 0), 0).toFixed(2));
  }

  totalDescuentos(): number {
    return Number(this.ventasFiltradas().reduce((sum, v) => sum + (v.montoDescuento || 0), 0).toFixed(2));
  }

  totalImporteFacturado(): number {
    return Number(this.ventasFiltradas().reduce((sum, v) => sum + (v.total || 0), 0).toFixed(2));
  }

  // ==========================================
  // Exportar Reporte de Ventas a CSV para SUNAT
  // ==========================================
  descargarCsvSunat(): void {
    const lista = this.ventasFiltradas();
    if (!lista.length) {
      alert('No hay ventas registradas para exportar con los filtros seleccionados.');
      return;
    }

    // Cabeceras oficiales estándar para Registro de Ventas e Ingresos (PLE / SUNAT Formato 14.1)
    const encabezados = [
      'Periodo',
      'Correlativo',
      'Fecha Emision',
      'Fecha Vencimiento',
      'Tipo Comprobante (Tabla 10)',
      'Serie Comprobante',
      'Numero Comprobante',
      'Tipo Doc Cliente (Tabla 2)',
      'Numero Doc Cliente (RUC/DNI)',
      'Razon Social / Nombres Cliente',
      'Base Imponible (Op. Gravada)',
      'Descuento',
      'IGV (18%)',
      'Importe Total',
      'Moneda',
      'Medio de Pago',
      'Estado Comprobante'
    ];

    const filasCsv: string[] = [];
    filasCsv.push(encabezados.join(';'));

    lista.forEach((v, index) => {
      const fecha = v.fechaHora ? v.fechaHora.substring(0, 10) : '';
      const periodo = fecha ? fecha.substring(0, 7).replace('-', '') : '';
      
      // Tipo comprobante según SUNAT Tabla 10: 01=Factura, 03=Boleta, 00=Nota de venta
      let tipoCompSunat = '03'; // Boleta por defecto
      if (v.tipoComprobante === 'FACTURA') tipoCompSunat = '01';
      else if (v.tipoComprobante === 'NOTA_VENTA') tipoCompSunat = '00';

      // Tipo documento identidad según SUNAT Tabla 2: 1=DNI, 6=RUC, 0=Otros
      let tipoDocCliSunat = '1';
      if (v.cliente?.tipoDocumento === 'RUC') tipoDocCliSunat = '6';
      else if (v.cliente?.tipoDocumento === 'SIN_DOCUMENTO') tipoDocCliSunat = '0';

      const numDocCli = v.cliente?.numeroDocumento || '00000000';
      const nomCli = (v.cliente?.nombresORazonSocial || 'CLIENTES VARIOS').replace(/;/g, ' ');

      const baseImponible = (v.subtotal || 0).toFixed(2);
      const descuento = (v.montoDescuento || 0).toFixed(2);
      const igv = (v.igv || 0).toFixed(2);
      const total = (v.total || 0).toFixed(2);
      const estado = v.estado === 'COMPLETADA' ? '1' : '2'; // 1=Valido, 2=Anulado

      const fila = [
        periodo,
        (index + 1).toString().padStart(6, '0'),
        fecha,
        fecha,
        tipoCompSunat,
        v.serieComprobante,
        v.numeroComprobante,
        tipoDocCliSunat,
        numDocCli,
        `"${nomCli}"`,
        baseImponible,
        descuento,
        igv,
        total,
        'PEN',
        v.medioPago,
        estado
      ];

      filasCsv.push(fila.join(';'));
    });

    const csvContent = '\uFEFF' + filasCsv.join('\r\n'); // \uFEFF añade BOM UTF-8 para apertura directa y limpia en Microsoft Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    const fechaDescarga = new Date().toISOString().substring(0, 10);
    enlace.href = url;
    enlace.setAttribute('download', `SUNAT_Registro_Ventas_${fechaDescarga}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }
}
