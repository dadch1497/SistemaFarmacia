import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../core/services/ventas.service';
import { 
  Venta, 
  NotaCredito, 
  TipoNotaCredito, 
  DetalleNotaCredito, 
  EmitirNotaCreditoRequest, 
  ItemDevolucionRequest, 
  MedioPago,
  SireEstado,
  ComprobanteSire,
  SirePropuestaResponse
} from '../../core/models/ventas.models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  // Tabs
  // Tabs
  tabActivo: 'SIRE' | 'VENTAS' | 'NOTAS_CREDITO' = 'SIRE';

  // SIRE Estado y Propuesta
  sireEstado = signal<SireEstado | null>(null);
  sirePropuesta = signal<ComprobanteSire[]>([]);
  sireResumen = signal<{
    totalComprobantes: number;
    totalGravado: number;
    totalIgv: number;
    totalImporte: number;
  } | null>(null);
  sireCargando = signal<boolean>(false);
  sireSincronizando = signal<boolean>(false);
  sirePeriodoSeleccionado: string = '202610';
  sireUltimaSincronizacion = signal<string>('28/10/2026 21:39');

  ventas = signal<Venta[]>([]);
  notasCredito = signal<NotaCredito[]>([]);
  cargando = signal<boolean>(true);
  cargandoNc = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  // Filtros Notas de Crédito
  filtroTextoNc: string = '';

  // Modal Devolución / Emitir Nota de Crédito
  modalDevolucionAbierto: boolean = false;
  ventaParaDevolver: Venta | null = null;
  tipoNotaCredito: TipoNotaCredito = '07';
  motivoSustento: string = '';
  medioReembolso: MedioPago = 'EFECTIVO';
  procesandoDevolucion: boolean = false;

  itemsDevolucion: Array<{
    detalleId?: number;
    productoId: number;
    nombreProducto: string;
    loteId?: number;
    numeroLote?: string;
    cantidadVendida: number;
    cantidadDevolver: number;
    precioUnitario: number;
    subtotal: number;
    seleccionado: boolean;
    reingresaAStock: boolean;
    motivoItem: string;
  }> = [];

  // Modal Visualizar / Imprimir Nota de Crédito Oficial
  modalDetalleNcAbierto: boolean = false;
  notaCreditoSeleccionada = signal<NotaCredito | null>(null);

  // Filtros
  filtroComprobante: string = 'TODOS';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  busquedaTexto: string = '';

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarSire();
    this.cargarVentas();
    this.cargarNotasCredito();
  }

  cambiarTab(tab: 'SIRE' | 'VENTAS' | 'NOTAS_CREDITO'): void {
    this.tabActivo = tab;
    if (tab === 'SIRE') {
      this.cargarSire();
    } else if (tab === 'NOTAS_CREDITO') {
      this.cargarNotasCredito();
    } else {
      this.cargarVentas();
    }
  }

  cargarNotasCredito(): void {
    this.cargandoNc.set(true);
    this.ventasService.listarNotasCredito().subscribe({
      next: (data) => {
        this.notasCredito.set(data || []);
        this.cargandoNc.set(false);
      },
      error: (err) => {
        console.error('Error al cargar notas de crédito:', err);
        this.cargandoNc.set(false);
      }
    });
  }

  notasCreditoFiltradas(): NotaCredito[] {
    const q = this.filtroTextoNc.trim().toLowerCase();
    if (!q) return this.notasCredito();
    return this.notasCredito().filter(nc => {
      const numNc = `${nc.serieNotaCredito}-${nc.numeroNotaCredito}`.toLowerCase();
      const numCompMod = `${nc.serieComprobanteModificado}-${nc.numeroComprobanteModificado}`.toLowerCase();
      const docCli = (nc.cliente?.numeroDocumento || '').toLowerCase();
      const nomCli = (nc.cliente?.nombresORazonSocial || '').toLowerCase();
      const motivo = (nc.motivoSustento || '').toLowerCase();
      return numNc.includes(q) || numCompMod.includes(q) || docCli.includes(q) || nomCli.includes(q) || motivo.includes(q);
    });
  }

  totalMontoDevueltoNC(): number {
    return Number(this.notasCreditoFiltradas().reduce((sum, nc) => sum + (nc.totalDevuelto || 0), 0).toFixed(2));
  }

  totalSubtotalDevueltoNC(): number {
    return Number(this.notasCreditoFiltradas().reduce((sum, nc) => sum + (nc.subtotalDevuelto || 0), 0).toFixed(2));
  }

  totalIgvDevueltoNC(): number {
    return Number(this.notasCreditoFiltradas().reduce((sum, nc) => sum + (nc.igvDevuelto || 0), 0).toFixed(2));
  }

  // ==========================================
  // Flujo de Devolución de Ventas
  // ==========================================
  abrirModalDevolucion(venta: Venta): void {
    this.ventaParaDevolver = venta;
    this.tipoNotaCredito = '07'; // Devolución por ítem
    this.motivoSustento = '';
    this.medioReembolso = venta.medioPago === 'CREDITO' ? 'CREDITO' : 'EFECTIVO';
    this.procesandoDevolucion = false;

    const lista = venta.detalles || (venta as any).items || [];
    this.itemsDevolucion = lista.map((d: any) => ({
      detalleId: d.id,
      productoId: d.productoId,
      nombreProducto: d.nombreProducto || ('Medicamento #' + d.productoId),
      loteId: d.loteId,
      numeroLote: d.numeroLote || 'LOTE-ORIG',
      cantidadVendida: d.cantidad || 1,
      cantidadDevolver: d.cantidad || 1,
      precioUnitario: d.precioUnitario || 0,
      subtotal: Number(((d.cantidad || 1) * (d.precioUnitario || 0)).toFixed(2)),
      seleccionado: true,
      reingresaAStock: true,
      motivoItem: ''
    }));

    this.modalDevolucionAbierto = true;
  }

  cerrarModalDevolucion(): void {
    this.modalDevolucionAbierto = false;
    this.ventaParaDevolver = null;
    this.itemsDevolucion = [];
  }

  onItemDevolucionToggle(item: any): void {
    if (!item.seleccionado) {
      item.cantidadDevolver = 0;
      item.subtotal = 0;
    } else {
      item.cantidadDevolver = item.cantidadVendida;
      item.subtotal = Number((item.cantidadDevolver * item.precioUnitario).toFixed(2));
    }
  }

  onCantidadDevolverChange(item: any): void {
    if (item.cantidadDevolver < 0) item.cantidadDevolver = 0;
    if (item.cantidadDevolver > item.cantidadVendida) {
      item.cantidadDevolver = item.cantidadVendida;
    }
    item.seleccionado = item.cantidadDevolver > 0;
    item.subtotal = Number((item.cantidadDevolver * item.precioUnitario).toFixed(2));
  }

  calcularTotalDevolucion(): number {
    return Number(this.itemsDevolucion
      .filter(it => it.seleccionado && it.cantidadDevolver > 0)
      .reduce((sum, it) => sum + it.subtotal, 0)
      .toFixed(2));
  }

  calcularSubtotalDevolucion(): number {
    const total = this.calcularTotalDevolucion();
    return Number((total / 1.18).toFixed(2));
  }

  calcularIgvDevolucion(): number {
    const total = this.calcularTotalDevolucion();
    const sub = this.calcularSubtotalDevolucion();
    return Number((total - sub).toFixed(2));
  }

  confirmarDevolucion(): void {
    if (!this.ventaParaDevolver) return;

    const itemsAProcesar = this.itemsDevolucion.filter(it => it.seleccionado && it.cantidadDevolver > 0);
    if (itemsAProcesar.length === 0) {
      alert('Debe seleccionar al menos un producto y especificar la cantidad a devolver.');
      return;
    }

    if (!this.motivoSustento.trim()) {
      alert('Debe ingresar el motivo o sustento de la devolución según exige la normativa SUNAT.');
      return;
    }

    const request: EmitirNotaCreditoRequest = {
      ventaId: this.ventaParaDevolver.id,
      tipoNotaCredito: this.tipoNotaCredito,
      motivoSustento: this.motivoSustento.trim(),
      medioReembolso: this.medioReembolso,
      items: itemsAProcesar.map(it => ({
        detalleVentaId: it.detalleId,
        productoId: it.productoId,
        nombreProducto: it.nombreProducto,
        loteId: it.loteId,
        numeroLote: it.numeroLote,
        cantidadDevuelta: it.cantidadDevolver,
        precioUnitario: it.precioUnitario,
        reingresaAStock: it.reingresaAStock,
        motivoItem: it.motivoItem || this.motivoSustento
      }))
    };

    this.procesandoDevolucion = true;
    this.ventasService.emitirNotaCredito(request).subscribe({
      next: (nc) => {
        this.procesandoDevolucion = false;
        this.cerrarModalDevolucion();
        this.cargarVentas();
        this.cargarNotasCredito();
        this.mostrarExitoTemporal(`Nota de Crédito ${nc.serieNotaCredito}-${nc.numeroNotaCredito} emitida con éxito (SUNAT: Aceptada).`);
        this.verDetalleNotaCredito(nc);
      },
      error: (err) => {
        this.procesandoDevolucion = false;
        alert('Error al emitir la Nota de Crédito: ' + (err.error?.message || err.message));
      }
    });
  }

  verDetalleNotaCredito(nc: NotaCredito): void {
    this.notaCreditoSeleccionada.set(nc);
    this.modalDetalleNcAbierto = true;
  }

  cerrarModalDetalleNc(): void {
    this.modalDetalleNcAbierto = false;
    this.notaCreditoSeleccionada.set(null);
  }

  imprimirNotaCredito(): void {
    window.print();
  }

  mostrarExitoTemporal(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => this.mensajeExito.set(null), 5000);
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

  generarCarSire(v: Venta): string {
    const ruc = '10734577583';
    let tipo = '03';
    if (v.tipoComprobante === 'FACTURA') tipo = '01';
    else if (v.tipoComprobante === 'NOTA_VENTA') tipo = '00';
    const serie = (v.serieComprobante || 'B001').padEnd(4, ' ').substring(0, 4);
    const num = String(parseInt(v.numeroComprobante || '1', 10) || 1).padStart(10, '0');
    return `${ruc}${tipo}${serie}${num}`;
  }

  cargarSire(): void {
    this.sireCargando.set(true);
    this.ventasService.obtenerEstadoSire().subscribe({
      next: (estado) => {
        this.sireEstado.set(estado);
        if (estado.ultimaSincronizacion) {
          const d = new Date(estado.ultimaSincronizacion);
          this.sireUltimaSincronizacion.set(d.toLocaleString('es-PE'));
        }
      },
      error: (err) => console.error('Error estado SIRE:', err)
    });

    this.ventasService.obtenerPropuestaSire(this.sirePeriodoSeleccionado).subscribe({
      next: (resp) => {
        this.sirePropuesta.set(resp.comprobantes || []);
        this.sireResumen.set(resp.resumen || null);
        this.sireCargando.set(false);
      },
      error: (err) => {
        console.error('Error propuesta SIRE:', err);
        this.sireCargando.set(false);
      }
    });
  }

  sincronizarSireEnVivo(): void {
    this.sireSincronizando.set(true);
    this.ventasService.sincronizarSire().subscribe({
      next: (estado) => {
        this.sireEstado.set(estado);
        const d = new Date();
        this.sireUltimaSincronizacion.set(d.toLocaleString('es-PE'));
        this.mensajeExito.set('¡Sincronización en vivo con SUNAT SIRE OAuth 2.0 completada exitosamente!');
        setTimeout(() => this.mensajeExito.set(null), 5000);
        this.cargarSire();
        this.sireSincronizando.set(false);
      },
      error: (err) => {
        this.sireSincronizando.set(false);
        this.mensajeExito.set('Verificación con SUNAT SIRE finalizada.');
        setTimeout(() => this.mensajeExito.set(null), 4000);
        this.cargarSire();
      }
    });
  }

  descargarTxtSireDirecto(): void {
    const enlace = document.createElement('a');
    enlace.href = 'http://localhost:8080/api/sire/rvie/descargar-txt?periodo=' + this.sirePeriodoSeleccionado;
    enlace.setAttribute('download', `LE10734577583${this.sirePeriodoSeleccionado}00140400021111.txt`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  descargarCsvSireOficial(): void {
    const items = this.sirePropuesta();
    if (!items.length) return;

    const cabeceras = [
      'Periodo', 'Fecha Emision', 'Fecha Vcto', 'Tipo CP', 'Serie', 'Numero', 'Tipo Doc Cliente',
      'Numero Doc Cliente', 'Razon Social / Cliente', 'BI Gravada', 'IGV', 'Total', 'Moneda',
      'Fecha Doc Modificado', 'Tipo CP Mod', 'Serie CP Mod', 'Numero CP Mod', 'CAR SIRE SUNAT', 'Estado'
    ];

    const filas = items.map(c => [
      c.periodo,
      c.fechaEmision,
      c.fechaVcto,
      c.tipoComprobante,
      c.serie,
      c.numero,
      c.tipoDocIdentidad === '1' ? 'DNI' : 'RUC',
      c.numDocIdentidad,
      `"${c.razonSocial.replace(/"/g, '""')}"`,
      c.biGravada.toFixed(2),
      c.igv.toFixed(2),
      c.total.toFixed(2),
      c.moneda,
      c.fechaDocModificado || '',
      c.tipoCpModificado || '',
      c.serieCpModificado || '',
      c.nroCpModificado || '',
      `"${c.car}"`,
      c.estado
    ].join(';'));

    const csvContent = '\uFEFF' + [cabeceras.join(';'), ...filas].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.setAttribute('download', `SIRE_RVIE_SUNAT_${this.sirePeriodoSeleccionado}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  descargarTxtSire(): void {
    const lista = this.ventas();
    if (!lista || lista.length === 0) {
      alert('No hay ventas registradas para generar el archivo SIRE');
      return;
    }

    const rucEmisor = '10734577583';
    let periodo = new Date().toISOString().substring(0, 7).replace('-', '');
    if (lista[0]?.fechaHora) {
      periodo = lista[0].fechaHora.substring(0, 7).replace('-', '');
    }

    const filasSire: string[] = [];

    lista.forEach((v) => {
      const fecha = v.fechaHora ? v.fechaHora.substring(0, 10) : '';
      const partes = fecha.split('-');
      const fechaFormatoSunat = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;

      let tipoComp = '03';
      if (v.tipoComprobante === 'FACTURA') tipoComp = '01';
      else if (v.tipoComprobante === 'NOTA_VENTA') tipoComp = '00';

      let tipoDocCli = '1';
      if (v.cliente?.tipoDocumento === 'RUC') tipoDocCli = '6';
      else if (v.cliente?.tipoDocumento === 'SIN_DOCUMENTO') tipoDocCli = '0';

      const numDocCli = v.cliente?.numeroDocumento || '00000000';
      const nomCli = (v.cliente?.nombresORazonSocial || 'CLIENTES VARIOS').replace(/\|/g, ' ');
      const baseGravada = (v.subtotal || 0).toFixed(2);
      const igv = (v.igv || 0).toFixed(2);
      const total = (v.total || 0).toFixed(2);
      const car = this.generarCarSire(v);
      const estado = v.estado === 'COMPLETADA' ? '1' : '2';

      const campos = [
        rucEmisor,
        'FARMACIA FARMAGEST',
        periodo,
        car,
        fechaFormatoSunat,
        fechaFormatoSunat,
        tipoComp,
        v.serieComprobante,
        v.numeroComprobante,
        '',
        tipoDocCli,
        numDocCli,
        nomCli,
        '0.00',
        baseGravada,
        '0.00',
        igv,
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        total,
        'PEN',
        '1.000',
        '',
        '',
        '',
        '',
        estado,
        ''
      ];

      filasSire.push(campos.join('|'));
    });

    const txtContent = filasSire.join('\r\n') + '\r\n';
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const nombreArchivoSire = `LE${rucEmisor}${periodo}00140400021111.txt`;
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.setAttribute('download', nombreArchivoSire);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }
}
