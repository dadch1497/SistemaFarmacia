import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../core/services/inventario.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { AuthService } from '../../core/services/auth.service';
import {
  StockProducto,
  Lote,
  MovimientoKardex,
  AlertaInventario,
  AjusteStockRequest
} from '../../core/models/inventario.models';
import { Producto } from '../../core/models/catalogo.models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  // Tabs activos
  tabActivo: 'EXISTENCIAS' | 'VENCIMIENTOS' | 'STOCK_BAJO' | 'KARDEX' = 'EXISTENCIAS';

  // Estados reactivos
  stocks = signal<StockProducto[]>([]);
  lotesPorVencer = signal<Lote[]>([]);
  stockBajoLista = signal<StockProducto[]>([]);
  alertas = signal<AlertaInventario[]>([]);
  productosCatalogo = signal<Map<number, Producto>>(new Map());

  cargando = signal<boolean>(false);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  // Filtros
  filtroTexto: string = '';
  diasVencimiento: number = 30; // 30 | 60 | 90

  // Inspección de Lotes por Producto
  productoSeleccionadoParaLotes: Producto | null = null;
  lotesDelProducto: Lote[] = [];
  modalLotesAbierto: boolean = false;

  // Inspección de Kardex
  productoSeleccionadoParaKardex: Producto | null = null;
  kardexMovimientos: MovimientoKardex[] = [];
  modalKardexAbierto: boolean = false;

  // Modal Acta DIGEMID de Baja y Destrucción
  modalActaDigemidAbierto: boolean = false;
  actaConfig = {
    numeroActa: 'ACTA-DIGEMID-2026-004',
    establecimiento: 'BOTICA FARMA GESTIÓN S.A.C. - SUCURSAL CENTRAL',
    ruc: '20601234567',
    diris: 'DIRIS LIMA ESTE / DIGEMID - MINSA',
    codigoEstablecimiento: 'EF-LIMA-2024-8902',
    directorTecnico: 'Q.F. Alejandro Morales Rivas',
    colegiatura: 'CQFP N° 18452',
    representanteLegal: 'Carlos Mendoza Salazar (DNI 45678912)',
    fechaEmision: new Date().toISOString().substring(0, 10),
    lugar: 'Av. Nicolás Ayllón 1250, Ate, Lima'
  };
  lotesParaActa: Array<{
    loteId: number;
    productoId: number;
    nombre: string;
    registroSanitario: string;
    numeroLote: string;
    fechaVencimiento: string;
    cantidad: number;
    costoUnitario: number;
    motivo: string;
  }> = [];

  // Modal Ajuste / Merma
  modalAjusteAbierto: boolean = false;
  lotesDisponiblesParaAjuste: Lote[] = [];
  ajusteForm: AjusteStockRequest = {
    productoId: 1,
    loteId: 1,
    tipoAjuste: 'AJUSTE_MERMA',
    cantidad: 1,
    motivo: ''
  };

  constructor(
    public inventarioService: InventarioService,
    public catalogoService: CatalogoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogoYStock();
    this.cargarAlertas();
  }

  cambiarTab(tab: 'EXISTENCIAS' | 'VENCIMIENTOS' | 'STOCK_BAJO' | 'KARDEX'): void {
    this.tabActivo = tab;
    if (tab === 'EXISTENCIAS') this.cargarStock();
    if (tab === 'VENCIMIENTOS') this.cargarLotesPorVencer(this.diasVencimiento);
    if (tab === 'STOCK_BAJO') this.cargarStockBajo();
  }

  cargarCatalogoYStock(): void {
    this.cargando.set(true);
    // 1. Obtener catálogo para enriquecer nombres y presentaciones
    this.catalogoService.listarProductos(0, 100).subscribe({
      next: (res) => {
        const mapa = new Map<number, Producto>();
        res.content.forEach(p => mapa.set(p.id, p));
        this.productosCatalogo.set(mapa);
        this.cargarStock();
      },
      error: () => {
        this.cargarStock();
      }
    });
  }

  cargarStock(): void {
    this.cargando.set(true);
    this.inventarioService.listarStock().subscribe({
      next: (data) => {
        const mapa = this.productosCatalogo();
        const enriquecidos = data.map(s => {
          const prod = mapa.get(s.productoId);
          return {
            ...s,
            nombreProducto: prod ? prod.nombre : `Producto #${s.productoId}`,
            codigoBarras: prod ? prod.codigoBarras : '---',
            presentacion: prod ? prod.presentacion : ''
          };
        });
        this.stocks.set(enriquecidos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo conectar con el microservicio de inventario.');
      }
    });
  }

  cargarLotesPorVencer(dias: number): void {
    this.diasVencimiento = dias;
    this.cargando.set(true);
    this.inventarioService.listarLotesPorVencer(dias).subscribe({
      next: (data) => {
        this.lotesPorVencer.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cargarStockBajo(): void {
    this.cargando.set(true);
    this.inventarioService.listarStockBajo().subscribe({
      next: (data) => {
        const mapa = this.productosCatalogo();
        const enriquecidos = data.map(s => {
          const prod = mapa.get(s.productoId);
          return {
            ...s,
            nombreProducto: prod ? prod.nombre : `Producto #${s.productoId}`,
            codigoBarras: prod ? prod.codigoBarras : '---',
            presentacion: prod ? prod.presentacion : ''
          };
        });
        this.stockBajoLista.set(enriquecidos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cargarAlertas(): void {
    this.inventarioService.listarAlertas().subscribe({
      next: (data) => this.alertas.set(data),
      error: (err) => console.error('Error cargando alertas', err)
    });
  }

  atenderAlerta(id: number): void {
    this.inventarioService.atenderAlerta(id).subscribe({
      next: () => {
        this.cargarAlertas();
        this.mostrarExito('Alerta marcada como atendida.');
      }
    });
  }

  // --- Modal Lotes ---
  verLotesDeProducto(stockItem: StockProducto): void {
    const prod = this.productosCatalogo().get(stockItem.productoId);
    this.productoSeleccionadoParaLotes = prod || null;
    this.cargando.set(true);
    this.inventarioService.listarLotesPorProducto(stockItem.productoId).subscribe({
      next: (lotes) => {
        this.lotesDelProducto = lotes;
        this.modalLotesAbierto = true;
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        alert('Error al consultar lotes del producto.');
      }
    });
  }

  cerrarModalLotes(): void {
    this.modalLotesAbierto = false;
    this.productoSeleccionadoParaLotes = null;
    this.lotesDelProducto = [];
  }

  // --- Modal Kardex ---
  verKardexDeProducto(stockItem: StockProducto): void {
    const prod = this.productosCatalogo().get(stockItem.productoId);
    this.productoSeleccionadoParaKardex = prod || null;
    this.cargando.set(true);
    this.inventarioService.listarKardex(stockItem.productoId).subscribe({
      next: (movimientos) => {
        this.kardexMovimientos = movimientos;
        this.modalKardexAbierto = true;
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        alert('Error al consultar kardex del producto.');
      }
    });
  }

  cerrarModalKardex(): void {
    this.modalKardexAbierto = false;
    this.productoSeleccionadoParaKardex = null;
    this.kardexMovimientos = [];
  }

  // --- Modal Ajuste / Merma ---
  abrirModalAjuste(stockItem?: StockProducto): void {
    const defaultProductoId = stockItem ? stockItem.productoId : (this.stocks()[0]?.productoId || 1);
    this.ajusteForm = {
      productoId: defaultProductoId,
      loteId: 0,
      tipoAjuste: 'AJUSTE_MERMA',
      cantidad: 1,
      motivo: ''
    };
    this.onProductoAjusteChange(defaultProductoId);
    this.modalAjusteAbierto = true;
  }

  onProductoAjusteChange(productoId: number): void {
    this.inventarioService.listarLotesPorProducto(productoId).subscribe({
      next: (lotes) => {
        this.lotesDisponiblesParaAjuste = lotes;
        if (lotes.length > 0) {
          this.ajusteForm.loteId = lotes[0].id;
        }
      }
    });
  }

  cerrarModalAjuste(): void {
    this.modalAjusteAbierto = false;
  }

  guardarAjuste(): void {
    if (!this.ajusteForm.loteId) {
      alert('Debe seleccionar un lote válido para el ajuste');
      return;
    }
    if (this.ajusteForm.cantidad <= 0) {
      alert('La cantidad a ajustar debe ser mayor a 0');
      return;
    }
    if (!this.ajusteForm.motivo.trim()) {
      alert('Debe indicar un motivo obligatorio para la auditoría');
      return;
    }

    this.cargando.set(true);
    this.inventarioService.registrarAjuste(this.ajusteForm).subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarModalAjuste();
        this.mostrarExito('Ajuste de inventario registrado y auditado correctamente en el Kardex.');
        this.cargarStock();
        this.cargarAlertas();
      },
      error: (err) => {
        this.cargando.set(false);
        alert(err.error?.detail || 'Error al registrar el ajuste de stock.');
      }
    });
  }

  getNombreProducto(productoId: number): string {
    const p = this.productosCatalogo().get(productoId);
    return p ? p.nombre : `Producto #${productoId}`;
  }

  abrirModalActaDigemid(): void {
    const mapa = this.productosCatalogo();
    const items = this.lotesPorVencer().map(l => {
      const prod = mapa.get(l.productoId);
      return {
        loteId: l.id,
        productoId: l.productoId,
        nombre: prod ? prod.nombre : `Producto #${l.productoId}`,
        registroSanitario: 'RS-N-28491-PE',
        numeroLote: l.numeroLote,
        fechaVencimiento: l.fechaVencimiento,
        cantidad: l.cantidadActual,
        costoUnitario: l.costoUnitario || 0,
        motivo: 'Vencimiento de vida útil / Merma sanitaria'
      };
    });
    this.lotesParaActa = items;
    this.modalActaDigemidAbierto = true;
  }

  cerrarModalActaDigemid(): void {
    this.modalActaDigemidAbierto = false;
  }

  imprimirActaDigemid(): void {
    window.print();
  }

  totalUnidadesBaja(): number {
    return this.lotesParaActa.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  }

  totalValorizadoBaja(): number {
    return this.lotesParaActa.reduce((acc, item) => acc + ((item.cantidad || 0) * (item.costoUnitario || 0)), 0);
  }

  mostrarExito(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => this.mensajeExito.set(null), 4000);
  }
}
