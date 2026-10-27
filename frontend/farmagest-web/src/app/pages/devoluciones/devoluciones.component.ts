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
  buscarComprobanteRapido(): void {
    const q = this.codigoBusqueda.trim();
    if (!q) {
      this.mostrarError('Por favor ingrese el número o serie del comprobante (ej: B001-00001024 o 00001024).');
      return;
    }

    this.buscandoVenta = true;
    this.ventasService.buscarComprobante(q).subscribe({
      next: (venta) => {
        this.buscandoVenta = false;
        if (venta.estado === 'ANULADA') {
          this.mostrarError(`El comprobante ${venta.serieComprobante}-${venta.numeroComprobante} ya se encuentra ANULADO.`);
          return;
        }
        this.abrirModalDevolucion(venta);
      },
      error: () => {
        this.buscandoVenta = false;
        this.mostrarError(`No se encontró ningún comprobante con la referencia "${q}".`);
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
