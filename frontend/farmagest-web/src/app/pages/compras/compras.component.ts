import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComprasService } from '../../core/services/compras.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Proveedor,
  CrearProveedorRequest,
  OrdenCompra,
  CrearOrdenCompraRequest,
  EstadoOrden,
  IngresoMercaderia,
  RegistrarIngresoRequest
} from '../../core/models/compras.models';
import { Producto } from '../../core/models/catalogo.models';
import { GuiaCompraComponent } from '../../shared/guia-compra/guia-compra.component';
import { RecepcionDocumentoComponent } from '../../shared/recepcion-documento/recepcion-documento.component';
import { RecepcionPreparada, fechaDocumento } from '../../core/models/recepcion-documento';

interface DetalleOrdenItemForm {
  productoId: number;
  nombreProducto?: string;
  cantidadSolicitada: number;
  costoPactado: number;
  subtotal: number;
}

interface DetalleIngresoItemForm {
  productoId: number;
  nombreProducto?: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadRecibida: number;
  costoUnitarioReal: number;
  subtotal: number;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, RecepcionDocumentoComponent, GuiaCompraComponent],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit {
  tabActivo: 'PROVEEDORES' | 'ORDENES' | 'INGRESOS' = 'ORDENES';

  // Signals de datos
  proveedores = signal<Proveedor[]>([]);
  ordenes = signal<OrdenCompra[]>([]);
  ingresos = signal<IngresoMercaderia[]>([]);
  productos = signal<Producto[]>([]);

  cargando = signal<boolean>(false);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  // Permisos
  esAdmin: boolean = false;
  esAlmacenero: boolean = false;
  esVendedor: boolean = false;

  // Filtros
  filtroProveedor: string = '';
  filtroOrden: string = '';
  filtroIngreso: string = '';

  // ------------------------------------------
  // Modal Proveedor
  // ------------------------------------------
  modalProveedorAbierto: boolean = false;
  proveedorEditandoId: number | null = null;
  proveedorForm: CrearProveedorRequest = {
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  // ------------------------------------------
  // Modal Nueva Orden de Compra
  // ------------------------------------------
  modalNuevaOrdenAbierto: boolean = false;
  ordenForm: {
    proveedorId: number | null;
    observaciones: string;
    items: DetalleOrdenItemForm[];
  } = {
    proveedorId: null,
    observaciones: '',
    items: []
  };

  itemOrdenTemporal: {
    productoId: number | null;
    cantidad: number;
    costoPactado: number;
  } = {
    productoId: null,
    cantidad: 10,
    costoPactado: 10.00
  };

  // ------------------------------------------
  // Modal Detalle Orden
  // ------------------------------------------
  modalDetalleOrdenAbierto: boolean = false;
  ordenSeleccionada: OrdenCompra | null = null;

  // ------------------------------------------
  // Modal Registrar Ingreso de Mercadería
  // ------------------------------------------
  modalIngresoAbierto: boolean = false;
  leyendoCodigo = false;
  documentoPendiente = false;
  avisoEscaneo = signal('');
  ingresoForm: {
    ordenCompraId: number | null;
    numeroGuia: string;
    numeroFacturaProveedor: string;
    observaciones: string;
    items: DetalleIngresoItemForm[];
  } = {
    ordenCompraId: null,
    numeroGuia: '',
    numeroFacturaProveedor: '',
    observaciones: '',
    items: []
  };

  itemIngresoTemporal: {
    productoId: number | null;
    numeroLote: string;
    fechaVencimiento: string;
    cantidadRecibida: number;
    costoUnitarioReal: number;
  } = {
    productoId: null,
    numeroLote: '',
    fechaVencimiento: '',
    cantidadRecibida: 0,
    costoUnitarioReal: 0
  };

  // Modal Detalle Ingreso
  modalDetalleIngresoAbierto: boolean = false;
  ingresoSeleccionado: IngresoMercaderia | null = null;

  constructor(
    private comprasService: ComprasService,
    private catalogoService: CatalogoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.isAdmin();
    this.esAlmacenero = this.authService.isAlmacenero();
    this.esVendedor = this.authService.isVendedor();

    const url = this.router.url;
    if (url.includes('/proveedores')) {
      this.tabActivo = 'PROVEEDORES';
    } else if (url.includes('/compras/ingreso')) {
      this.tabActivo = 'INGRESOS';
    } else {
      this.tabActivo = 'ORDENES';
    }

    if (!this.esVendedor) {
      this.cargarTodo();
    }
  }

  cambiarTab(tab: 'PROVEEDORES' | 'ORDENES' | 'INGRESOS'): void {
    this.tabActivo = tab;
    this.limpiarMensajes();
  }

  cargarTodo(): void {
    this.cargando.set(true);
    this.limpiarMensajes();

    this.catalogoService.listarProductos(0, 100).subscribe({
      next: (resp) => {
        this.productos.set(resp.content || []);
      },
      error: () => {}
    });

    this.comprasService.listarProveedores().subscribe({
      next: (data) => {
        this.proveedores.set(data);
      },
      error: (err) => this.mostrarError('Error al cargar proveedores: ' + (err.error?.message || err.message))
    });

    this.comprasService.listarOrdenes().subscribe({
      next: (data) => {
        this.ordenes.set(data);
      },
      error: (err) => this.mostrarError('Error al cargar órdenes de compra: ' + (err.error?.message || err.message))
    });

    this.comprasService.listarIngresos().subscribe({
      next: (data) => {
        this.ingresos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.mostrarError('Error al cargar ingresos: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });
  }

  // ==========================================
  // Proveedores
  // ==========================================
  proveedoresFiltrados(): Proveedor[] {
    const query = this.filtroProveedor.trim().toLowerCase();
    if (!query) return this.proveedores();
    return this.proveedores().filter(p =>
      p.razonSocial.toLowerCase().includes(query) ||
      p.ruc.includes(query) ||
      (p.nombreComercial && p.nombreComercial.toLowerCase().includes(query))
    );
  }

  abrirModalNuevoProveedor(): void {
    this.proveedorEditandoId = null;
    this.proveedorForm = {
      ruc: '',
      razonSocial: '',
      nombreComercial: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: ''
    };
    this.modalProveedorAbierto = true;
  }

  abrirModalEditarProveedor(p: Proveedor): void {
    this.proveedorEditandoId = p.id;
    this.proveedorForm = {
      ruc: p.ruc,
      razonSocial: p.razonSocial,
      nombreComercial: p.nombreComercial || '',
      contacto: p.contacto || '',
      telefono: p.telefono || '',
      email: p.email || '',
      direccion: p.direccion || ''
    };
    this.modalProveedorAbierto = true;
  }

  guardarProveedor(): void {
    if (!this.proveedorForm.ruc || !this.proveedorForm.razonSocial) {
      this.mostrarError('El RUC y la Razón Social son obligatorios');
      return;
    }

    this.cargando.set(true);
    if (this.proveedorEditandoId) {
      this.comprasService.actualizarProveedor(this.proveedorEditandoId, this.proveedorForm).subscribe({
        next: () => {
          this.mostrarExito('Proveedor actualizado correctamente');
          this.modalProveedorAbierto = false;
          this.cargarTodo();
        },
        error: (err) => {
          this.mostrarError('Error al actualizar proveedor: ' + (err.error?.message || err.message));
          this.cargando.set(false);
        }
      });
    } else {
      this.comprasService.crearProveedor(this.proveedorForm).subscribe({
        next: () => {
          this.mostrarExito('Proveedor registrado exitosamente');
          this.modalProveedorAbierto = false;
          this.cargarTodo();
        },
        error: (err) => {
          this.mostrarError('Error al registrar proveedor: ' + (err.error?.message || err.message));
          this.cargando.set(false);
        }
      });
    }
  }

  darDeBajaProveedor(id: number): void {
    if (!confirm('¿Confirma la baja lógica de este proveedor?')) return;
    this.cargando.set(true);
    this.comprasService.darDeBajaProveedor(id).subscribe({
      next: () => {
        this.mostrarExito('Proveedor dado de baja');
        this.cargarTodo();
      },
      error: (err) => {
        this.mostrarError('Error al dar de baja proveedor: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });
  }

  // ==========================================
  // Órdenes de Compra
  // ==========================================
  ordenesFiltradas(): OrdenCompra[] {
    const query = this.filtroOrden.trim().toLowerCase();
    if (!query) return this.ordenes();
    return this.ordenes().filter(o =>
      o.numeroOrden.toLowerCase().includes(query) ||
      (o.proveedor && o.proveedor.razonSocial.toLowerCase().includes(query)) ||
      o.estado.toLowerCase().includes(query)
    );
  }

  abrirModalNuevaOrden(): void {
    this.ordenForm = {
      proveedorId: this.proveedores().length > 0 ? this.proveedores()[0].id : null,
      observaciones: '',
      items: []
    };
    this.itemOrdenTemporal = {
      productoId: this.productos().length > 0 ? this.productos()[0].id : null,
      cantidad: 10,
      costoPactado: 10.00
    };
    this.alCambiarProductoOrdenTemporal();
    this.modalNuevaOrdenAbierto = true;
  }

  alCambiarProductoOrdenTemporal(): void {
    if (!this.itemOrdenTemporal.productoId) return;
    const prod = this.productos().find(p => p.id === Number(this.itemOrdenTemporal.productoId));
    if (prod && prod.precioCosto) {
      this.itemOrdenTemporal.costoPactado = prod.precioCosto;
    }
  }

  agregarItemOrden(): void {
    if (!this.itemOrdenTemporal.productoId) {
      this.mostrarError('Seleccione un producto');
      return;
    }
    if (this.itemOrdenTemporal.cantidad <= 0) {
      this.mostrarError('La cantidad debe ser mayor a 0');
      return;
    }
    if (this.itemOrdenTemporal.costoPactado <= 0) {
      this.mostrarError('El costo unitario pactado debe ser mayor a 0');
      return;
    }

    const prod = this.productos().find(p => p.id === Number(this.itemOrdenTemporal.productoId));
    const subtotal = Number((this.itemOrdenTemporal.cantidad * this.itemOrdenTemporal.costoPactado).toFixed(2));

    this.ordenForm.items.push({
      productoId: Number(this.itemOrdenTemporal.productoId),
      nombreProducto: prod ? prod.nombre : `Producto #${this.itemOrdenTemporal.productoId}`,
      cantidadSolicitada: this.itemOrdenTemporal.cantidad,
      costoPactado: this.itemOrdenTemporal.costoPactado,
      subtotal: subtotal
    });

    this.itemOrdenTemporal = {
      productoId: this.productos().length > 0 ? this.productos()[0].id : null,
      cantidad: 10,
      costoPactado: 10.00
    };
    this.alCambiarProductoOrdenTemporal();
  }

  eliminarItemOrden(index: number): void {
    this.ordenForm.items.splice(index, 1);
  }

  calcularSubtotalOrden(): number {
    return this.ordenForm.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  calcularIgvOrden(): number {
    return Number((this.calcularSubtotalOrden() * 0.18).toFixed(2));
  }

  calcularTotalOrden(): number {
    return Number((this.calcularSubtotalOrden() + this.calcularIgvOrden()).toFixed(2));
  }

  guardarOrden(): void {
    if (!this.ordenForm.proveedorId) {
      this.mostrarError('Seleccione un proveedor');
      return;
    }
    if (this.ordenForm.items.length === 0) {
      this.mostrarError('Agregue al menos un producto a la orden');
      return;
    }

    const request: CrearOrdenCompraRequest = {
      proveedorId: Number(this.ordenForm.proveedorId),
      sucursalId: 1,
      observaciones: this.ordenForm.observaciones,
      items: this.ordenForm.items.map(it => ({
        productoId: it.productoId,
        cantidadSolicitada: it.cantidadSolicitada,
        costoPactado: it.costoPactado
      }))
    };

    this.cargando.set(true);
    this.comprasService.crearOrden(request).subscribe({
      next: (orden) => {
        this.mostrarExito(`Orden ${orden.numeroOrden} registrada en estado PENDIENTE`);
        this.modalNuevaOrdenAbierto = false;
        this.cargarTodo();
      },
      error: (err) => {
        this.mostrarError('Error al crear orden: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });
  }

  verDetalleOrden(orden: OrdenCompra): void {
    this.ordenSeleccionada = orden;
    this.modalDetalleOrdenAbierto = true;
  }

  aprobarOrden(orden: OrdenCompra): void {
    if (!confirm(`¿Confirma la aprobación de la orden ${orden.numeroOrden}?`)) return;
    this.cargando.set(true);
    this.comprasService.cambiarEstadoOrden(orden.id, 'APROBADA').subscribe({
      next: (actualizada) => {
        this.mostrarExito(`Orden ${actualizada.numeroOrden} aprobada. Lista para recepción.`);
        this.modalDetalleOrdenAbierto = false;
        this.cargarTodo();
      },
      error: (err) => {
        this.mostrarError('Error al aprobar orden: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });
  }

  iniciarRecepcionDesdeOrden(orden: OrdenCompra): void {
    this.modalDetalleOrdenAbierto = false;
    this.tabActivo = 'INGRESOS';

    this.documentoPendiente = false;
    this.avisoEscaneo.set('');

    this.ingresoForm = {
      ordenCompraId: orden.id,
      numeroGuia: '',
      numeroFacturaProveedor: '',
      observaciones: `Recepción física correspondiente a la Orden ${orden.numeroOrden}`,
      items: orden.detalles.map(d => {
        const prod = this.productos().find(p => p.id === d.productoId);
        return {
          productoId: d.productoId,
          nombreProducto: prod ? prod.nombre : (d.nombreProducto || `Producto #${d.productoId}`),
          numeroLote: '',
          fechaVencimiento: '',
          cantidadRecibida: d.cantidadSolicitada,
          costoUnitarioReal: d.costoPactado,
          subtotal: Number((d.cantidadSolicitada * d.costoPactado).toFixed(2))
        };
      })
    };

    this.modalIngresoAbierto = true;
  }

  // ==========================================
  // Recepción de Mercadería (Ingresos)
  // ==========================================
  ingresosFiltrados(): IngresoMercaderia[] {
    const query = this.filtroIngreso.trim().toLowerCase();
    if (!query) return this.ingresos();
    return this.ingresos().filter(i =>
      i.numeroGuia.toLowerCase().includes(query) ||
      (i.numeroFacturaProveedor && i.numeroFacturaProveedor.toLowerCase().includes(query)) ||
      (i.numeroOrdenCompra && i.numeroOrdenCompra.toLowerCase().includes(query))
    );
  }

  abrirModalNuevoIngreso(): void {
    this.documentoPendiente = false;
    this.avisoEscaneo.set('');

    this.ingresoForm = {
      ordenCompraId: null,
      numeroGuia: '',
      numeroFacturaProveedor: '',
      observaciones: '',
      items: []
    };

    this.itemIngresoTemporal = {
      productoId: null,
      numeroLote: '',
      fechaVencimiento: '',
      cantidadRecibida: 0,
      costoUnitarioReal: 0
    };
    this.alCambiarProductoIngresoTemporal();

    this.modalIngresoAbierto = true;
  }

  alCambiarProductoIngresoTemporal(): void {
    if (!this.itemIngresoTemporal.productoId) return;
    const prod = this.productos().find(p => p.id === Number(this.itemIngresoTemporal.productoId));
    if (prod && prod.precioCosto) {
      this.itemIngresoTemporal.costoUnitarioReal = prod.precioCosto;
    }
  }

  seleccionarProductoPorCodigo(producto: Producto | null): void {
    this.avisoEscaneo.set('');
    this.itemIngresoTemporal.productoId = producto?.id ?? null;
    if (!producto) return;
    // The lookup searches the entire catalog, including products outside page 1.
    if (!this.productos().some(p => p.id === producto.id)) {
      this.productos.update(actuales => [...actuales, producto]);
    }
    this.itemIngresoTemporal.costoUnitarioReal = producto.precioCosto ?? 0;
    // Lot, expiration and quantity still require physical inspection and confirmation.
  }

  agregarItemIngreso(): void {
    if (this.leyendoCodigo) return;
    if (!this.itemIngresoTemporal.productoId) {
      this.mostrarError('Seleccione un producto para el ingreso');
      return;
    }
    if (!this.itemIngresoTemporal.numeroLote.trim()) {
      this.mostrarError('El Número de Lote es obligatorio para el control FEFO');
      return;
    }
    if (!this.itemIngresoTemporal.fechaVencimiento) {
      this.mostrarError('La Fecha de Vencimiento del lote es obligatoria');
      return;
    }
    if (this.itemIngresoTemporal.cantidadRecibida <= 0) {
      this.mostrarError('La cantidad recibida debe ser mayor a 0');
      return;
    }
    if (this.itemIngresoTemporal.costoUnitarioReal <= 0) {
      this.mostrarError('El costo unitario debe ser mayor a 0');
      return;
    }

    const prod = this.productos().find(p => p.id === Number(this.itemIngresoTemporal.productoId));
    const subtotal = Number((this.itemIngresoTemporal.cantidadRecibida * this.itemIngresoTemporal.costoUnitarioReal).toFixed(2));

    this.ingresoForm.items.push({
      productoId: Number(this.itemIngresoTemporal.productoId),
      nombreProducto: prod ? prod.nombre : `Producto #${this.itemIngresoTemporal.productoId}`,
      numeroLote: this.itemIngresoTemporal.numeroLote.trim().toUpperCase(),
      fechaVencimiento: this.itemIngresoTemporal.fechaVencimiento,
      cantidadRecibida: this.itemIngresoTemporal.cantidadRecibida,
      costoUnitarioReal: this.itemIngresoTemporal.costoUnitarioReal,
      subtotal: subtotal
    });


    this.itemIngresoTemporal = {
      productoId: null,
      numeroLote: '',
      fechaVencimiento: '',
      cantidadRecibida: 0,
      costoUnitarioReal: 0
    };
    this.alCambiarProductoIngresoTemporal();
  }

  agregarProductoEscaneado(producto: Producto): void {
    const costoIntroducido = this.itemIngresoTemporal.costoUnitarioReal;
    this.seleccionarProductoPorCodigo(producto);
    if (Number.isFinite(costoIntroducido) && costoIntroducido > 0) {
      this.itemIngresoTemporal.costoUnitarioReal = costoIntroducido;
    }
    const item = this.itemIngresoTemporal;
    if (!item.numeroLote.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(item.fechaVencimiento) ||
        !Number.isInteger(item.cantidadRecibida) || item.cantidadRecibida <= 0 ||
        !Number.isFinite(item.costoUnitarioReal) || item.costoUnitarioReal <= 0) {
      this.avisoEscaneo.set(`${producto.nombre} reconocido. Completa lote, vencimiento, cantidad y costo; luego pulsa + Agregar o vuelve a escanear.`);
      return;
    }
    this.agregarItemIngreso();
    this.avisoEscaneo.set(`${producto.nombre} agregado automáticamente a la recepción. El stock se actualizará al confirmar la recepción.`);
  }

  eliminarItemIngreso(index: number): void {
    this.ingresoForm.items.splice(index, 1);
  }

  calcularTotalIngreso(): number {
    return Number(this.ingresoForm.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  }

  actualizarSubtotalIngreso(item: DetalleIngresoItemForm): void {
    item.subtotal = Number.isFinite(item.cantidadRecibida) && Number.isFinite(item.costoUnitarioReal)
      ? Number((item.cantidadRecibida * item.costoUnitarioReal).toFixed(2)) : 0;
  }

  calcularTotalIngresoDto(ingreso: IngresoMercaderia): number {
    if (!ingreso.detalles) return 0;
    return Number(ingreso.detalles.reduce((sum, d) => sum + (d.cantidadRecibida * d.costoUnitarioReal), 0).toFixed(2));
  }

  ordenesParaRecepcion(): OrdenCompra[] {
    return this.ordenes().filter(o => o.estado === 'APROBADA' || o.estado === 'EN_TRANSITO');
  }

  aplicarDocumentoRecepcion(preparada: RecepcionPreparada): void {
    const { documento } = preparada;
    this.ingresoForm.ordenCompraId = preparada.ordenId;
    if (documento.guia.trim()) this.ingresoForm.numeroGuia = documento.guia.trim();
    if (documento.factura.trim()) this.ingresoForm.numeroFacturaProveedor = documento.factura.trim();
    this.ingresoForm.items = documento.filas.map(fila => ({
      productoId: fila.productoId!,
      nombreProducto: preparada.productos.find(p => p.id === fila.productoId)?.nombre || fila.descripcion,
      numeroLote: fila.lote.trim().toUpperCase(),
      fechaVencimiento: fila.vencimiento,
      cantidadRecibida: fila.cantidad!,
      costoUnitarioReal: fila.costo!,
      subtotal: Number((fila.cantidad! * fila.costo!).toFixed(2))
    }));
    this.documentoPendiente = false;
    this.avisoEscaneo.set('Documento revisado aplicado. Verifica los ítems de recepción y confirma el ingreso al terminar.');
  }

  guardarIngreso(): void {
    if (this.documentoPendiente || this.leyendoCodigo || this.cargando()) {
      this.mostrarError('Aplica el documento revisado o descártalo antes de confirmar la recepción.');
      return;
    }
    if (this.ingresoForm.items.some(it => !it.numeroLote.trim() || !fechaDocumento(it.fechaVencimiento) ||
      !Number.isInteger(it.cantidadRecibida) || it.cantidadRecibida <= 0 ||
      !Number.isFinite(it.costoUnitarioReal) || it.costoUnitarioReal <= 0)) {
      this.mostrarError('Completa el lote y vencimiento reales de cada fila, con cantidad y costo mayores a cero.');
      return;
    }
    if (!this.ingresoForm.numeroGuia.trim()) {
      this.mostrarError('El número de guía de remisión es obligatorio');
      return;
    }
    if (this.ingresoForm.items.length === 0) {
      this.mostrarError('Debe ingresar al menos un producto con su lote y vencimiento');
      return;
    }

    const request: RegistrarIngresoRequest = {
      ordenCompraId: this.ingresoForm.ordenCompraId,
      numeroGuia: this.ingresoForm.numeroGuia.trim(),
      numeroFacturaProveedor: this.ingresoForm.numeroFacturaProveedor ? this.ingresoForm.numeroFacturaProveedor.trim() : undefined,
      sucursalId: 1,
      observaciones: this.ingresoForm.observaciones,
      items: this.ingresoForm.items.map(it => ({
        productoId: it.productoId,
        numeroLote: it.numeroLote,
        fechaVencimiento: it.fechaVencimiento,
        cantidadRecibida: it.cantidadRecibida,
        costoUnitarioReal: it.costoUnitarioReal
      }))
    };

    this.cargando.set(true);
    this.comprasService.registrarIngreso(request).subscribe({
      next: (ingreso) => {
        this.mostrarExito(
          `¡Recepción con Guía ${ingreso.numeroGuia} registrada con éxito! ` +
          `Se publicó el evento "compra.ingreso-registrado" en RabbitMQ: el inventario fue actualizado automáticamente con los nuevos lotes.`
        );
        this.modalIngresoAbierto = false;
        this.cargarTodo();
      },
      error: (err) => {
        this.mostrarError('Error al registrar recepción de mercadería: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });
  }

  verDetalleIngreso(ingreso: IngresoMercaderia): void {
    this.ingresoSeleccionado = ingreso;
    this.modalDetalleIngresoAbierto = true;
  }

  obtenerNombreProducto(productoId: number): string {
    const p = this.productos().find(item => item.id === productoId);
    return p ? p.nombre : `Producto #${productoId}`;
  }

  // Helpers
  limpiarMensajes(): void {
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
  }

  mostrarExito(msg: string): void {
    this.mensajeExito.set(msg);
    this.mensajeError.set(null);
  }

  mostrarError(msg: string): void {
    this.mensajeError.set(msg);
    this.mensajeExito.set(null);
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '-';
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return fechaStr;
    }
  }

  obtenerClaseEstadoOrden(estado: EstadoOrden): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-orden-pendiente';
      case 'APROBADA': return 'estado-orden-aprobada';
      case 'EN_TRANSITO': return 'estado-orden-transito';
      case 'RECIBIDA': return 'estado-orden-recibida';
      case 'CANCELADA': return 'estado-orden-cancelada';
      default: return '';
    }
  }
}
