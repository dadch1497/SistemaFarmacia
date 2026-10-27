import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../core/services/ventas.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Venta,
  NotaCredito,
  TipoNotaCredito,
  EmitirNotaCreditoRequest,
  MedioPago
} from '../../core/models/ventas.models';

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./devoluciones.component.css']
})
export class DevolucionesComponent implements OnInit {

  tabActivo: 'NOTAS_CREDITO' | 'VENTAS' = 'NOTAS_CREDITO';

  ventas = signal<Venta[]>([]);
  notasCredito = signal<NotaCredito[]>([]);
  cargando = signal<boolean>(false);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  // Buscador rápido superior
  codigoBusqueda: string = '';
  buscandoVenta: boolean = false;

  // Filtros de texto
  filtroTextoNc: string = '';
  filtroTextoVentas: string = '';

  // Modal de Devolución
  modalDevolucionAbierto: boolean = false;
  ventaEncontradaBusqueda: Venta | null = null;
  ventaSeleccionada: Venta | null = null;
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

  // Modal Visualizar / Imprimir Nota de Crédito
  modalDetalleNcAbierto: boolean = false;
  notaCreditoSeleccionada = signal<NotaCredito | null>(null);

  constructor(
    private ventasService: VentasService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.ventasService.listarNotasCredito().subscribe({
      next: (ncs) => {
        this.notasCredito.set(ncs || []);
        this.ventasService.listarVentas().subscribe({
          next: (vts) => {
            this.ventas.set(vts || []);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false)
        });
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  cambiarTab(tab: 'NOTAS_CREDITO' | 'VENTAS'): void {
    this.tabActivo = tab;
  }

  // Búsqueda rápida por comprobante
  encontrarVentaEnMemoria(queryStr: string): Venta | undefined {
    let q = (queryStr || '').trim().toLowerCase();
    q = q.replace(/^ej:?\s*/i, '').replace(/^boleta:?\s*/i, '').replace(/^factura:?\s*/i, '').trim();
    if (!q) return undefined;

    const qClean = q.replace(/[-\s]/g, '');
    let qSerie = '';
    let qNum = '';
    const matchComp = q.match(/^([a-z0-9]{1,4})[-\s]+(\d+)$/i);
    if (matchComp) {
      qSerie = matchComp[1].toLowerCase();
      qNum = matchComp[2];
    }

    const isPureDigits = /^\d+$/.test(q);
    const qInt = isPureDigits ? parseInt(q, 10) : null;

    return this.ventas().find(v => {
      const full = `${v.serieComprobante}-${v.numeroComprobante}`.toLowerCase();
      const clean = `${v.serieComprobante}${v.numeroComprobante}`.toLowerCase();
      const numClean = (v.numeroComprobante || '').toLowerCase();
      const numInt = parseInt(v.numeroComprobante, 10);
      const serieComp = (v.serieComprobante || '').toLowerCase();
      const clienteDoc = (v.cliente?.numeroDocumento || '').toLowerCase();
      const clienteNom = (v.cliente?.nombresORazonSocial || '').toLowerCase();

      if (full.includes(q) || clean.includes(qClean) || numClean.includes(q)) return true;
      if (qSerie && qNum) {
        if (serieComp === qSerie && (numInt === parseInt(qNum, 10) || numClean.endsWith(qNum))) return true;
      }
      if (qInt !== null && !isNaN(qInt)) {
        if (numInt === qInt || numClean.endsWith(q)) return true;
      }
      if (clienteDoc.includes(q) || clienteNom.includes(q)) return true;

      return false;
    });
  }

  onBusquedaInputChange(): void {
    if (this.tabActivo === 'VENTAS') {
      this.filtroTextoVentas = this.codigoBusqueda.trim();
    }
  }

  buscarComprobanteRapido(): void {
    const qRaw = (this.codigoBusqueda || '').trim();
    if (!qRaw) {
      this.mostrarError('Por favor ingrese el número o serie del comprobante (ej: B001-00001024, F001-00000412 o solo 1024).');
      return;
    }

    const qLimpia = qRaw.replace(/^ej:?\s*/i, '').replace(/^boleta:?\s*/i, '').replace(/^factura:?\s*/i, '').trim();

    // 1. Buscar de inmediato en las ventas ya cargadas en memoria (0ms de latencia, 100% fiable)
    const enMemoria = this.encontrarVentaEnMemoria(qLimpia);
    if (enMemoria) {
      this.tabActivo = 'VENTAS';
      this.filtroTextoVentas = `${enMemoria.serieComprobante}-${enMemoria.numeroComprobante}`;
      this.ventaEncontradaBusqueda = enMemoria;
      this.mensajeError.set(null);
      this.mostrarExito(`Comprobante ${enMemoria.serieComprobante}-${enMemoria.numeroComprobante} encontrado con éxito.`);
      this.abrirModalDevolucion(enMemoria);
      return;
    }

    // 2. Si no se encontró en memoria, consultar al servidor backend
    this.buscandoVenta = true;
    this.ventasService.buscarComprobante(qLimpia).subscribe({
      next: (venta) => {
        this.buscandoVenta = false;
        if (!this.ventas().some(v => v.id === venta.id)) {
          this.ventas.update(lista => [venta, ...lista]);
        }
        this.tabActivo = 'VENTAS';
        this.filtroTextoVentas = `${venta.serieComprobante}-${venta.numeroComprobante}`;
        this.ventaEncontradaBusqueda = venta;
        this.mensajeError.set(null);
        this.mostrarExito(`Comprobante ${venta.serieComprobante}-${venta.numeroComprobante} encontrado con éxito.`);
        this.abrirModalDevolucion(venta);
      },
      error: () => {
        this.buscandoVenta = false;
        // Si no encontró por búsqueda exacta, buscar el primer término o mostrar sugerencias
        this.mostrarError(`No se encontró el comprobante con "${qRaw}". Compruebe que coincida con "B001-00001024" o "F001-00000412".`);
      }
    });
  }

  // Filtros
  notasCreditoFiltradas(): NotaCredito[] {
    const q = this.filtroTextoNc.trim().toLowerCase();
    if (!q) return this.notasCredito();
    return this.notasCredito().filter(nc => {
      const numNc = `${nc.serieNotaCredito}-${nc.numeroNotaCredito}`.toLowerCase();
      const numComp = `${nc.serieComprobanteModificado}-${nc.numeroComprobanteModificado}`.toLowerCase();
      const cliente = (nc.cliente?.nombresORazonSocial || '').toLowerCase();
      const doc = (nc.cliente?.numeroDocumento || '').toLowerCase();
      const motivo = (nc.motivoSustento || '').toLowerCase();
      return numNc.includes(q) || numComp.includes(q) || cliente.includes(q) || doc.includes(q) || motivo.includes(q);
    });
  }

  ventasFiltradas(): Venta[] {
    const q = this.filtroTextoVentas.trim().toLowerCase();
    if (!q) return this.ventas();
    return this.ventas().filter(v => {
      const comp = `${v.serieComprobante}-${v.numeroComprobante}`.toLowerCase();
      const cliente = (v.cliente?.nombresORazonSocial || '').toLowerCase();
      const doc = (v.cliente?.numeroDocumento || '').toLowerCase();
      return comp.includes(q) || cliente.includes(q) || doc.includes(q);
    });
  }

  // KPIs
  totalDevueltoNC(): number {
    return Number(this.notasCreditoFiltradas().reduce((sum, nc) => sum + (nc.totalDevuelto || 0), 0).toFixed(2));
  }

  totalSubtotalDevueltoNC(): number {
    return Number(this.notasCreditoFiltradas().reduce((sum, nc) => sum + (nc.subtotalDevuelto || 0), 0).toFixed(2));
  }

  totalIgvDevueltoNC(): number {
    return Number(this.notasCreditoFiltradas().reduce((sum, nc) => sum + (nc.igvDevuelto || 0), 0).toFixed(2));
  }

  // Acciones de Modal
  abrirModalDevolucion(venta: Venta): void {
    this.ventaSeleccionada = venta;
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
    this.ventaSeleccionada = null;
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
    if (item.cantidadDevolver > item.cantidadVendida) item.cantidadDevolver = item.cantidadVendida;
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
    if (!this.ventaSeleccionada) return;

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
      ventaId: this.ventaSeleccionada.id,
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
        this.cargarDatos();
        this.tabActivo = 'NOTAS_CREDITO';
        this.mostrarExito(`Nota de Crédito ${nc.serieNotaCredito}-${nc.numeroNotaCredito} emitida con éxito (SUNAT: ACEPTADA).`);
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

  mostrarExito(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => this.mensajeExito.set(null), 5000);
  }

  mostrarError(msg: string): void {
    this.mensajeError.set(msg);
    setTimeout(() => this.mensajeError.set(null), 5000);
  }
}
