import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../core/services/ventas.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { InventarioService } from '../../core/services/inventario.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Caja,
  SesionCaja,
  Cliente,
  TipoComprobante,
  MedioPago,
  RegistrarVentaRequest,
  ItemVentaRequest,
  Venta,
  VentaEspera,
  ValidarCuponResponse
} from '../../core/models/ventas.models';
import { Producto } from '../../core/models/catalogo.models';

export type FraccionVenta = 'UNIDAD' | 'TABLETA' | 'CAJA';

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
  fraccion: FraccionVenta;
  multiplicadorUnidades: number; // Factor de conversión a unidades de stock
  precioUnitario: number; // Precio según la presentación elegida
  descuento: number;
  subtotal: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {

  // Catálogo de productos y existencias
  productos = signal<Producto[]>([]);
  stockMap = signal<Map<number, number>>(new Map());
  busquedaProducto: string = '';

  // Caja y turno
  cajaActiva = signal<SesionCaja | null>(null);
  cajasDisponibles = signal<Caja[]>([]);
  cajaSeleccionadaId: number = 1;
  modalAperturaAbierto: boolean = false;
  modalCierreAbierto: boolean = false;
  montoAperturaInput: number = 100.00;
  montoArqueoFisicoInput: number = 0.00;
  observacionesCajaInput: string = '';

  // Carrito de compras / POS Ticket
  carrito = signal<CarritoItem[]>([]);

  // Estado visual del panel del carrito
  ultimoAgregado: CarritoItem | null = null;
  mostrarDni = false;

  // Cliente
  clienteSeleccionado = signal<Cliente | null>(null);
  docBusqueda: string = '';
  modalNuevoClienteAbierto: boolean = false;
  nuevoClienteForm: {
    tipoDocumento: 'DNI' | 'RUC';
    numeroDocumento: string;
    nombresORazonSocial: string;
    direccion: string;
    telefono: string;
    email: string;
  } = {
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombresORazonSocial: '',
    direccion: '',
    telefono: '',
    email: ''
  };

  // Formulario de Cobro
  tipoComprobante: TipoComprobante = 'BOLETA';
  medioPago: MedioPago = 'EFECTIVO';
  montoRecibido: number = 0;
  cuponCodigo: string = '';
  cuponAplicado = signal<ValidarCuponResponse | null>(null);
  descuentoManualPct: number = 0; // Hasta 5% para vendedor
  observacionesVenta: string = '';

  // Ventas en espera
  ventasEspera = signal<VentaEspera[]>([]);
  modalEsperaAbierto: boolean = false;

  // Comprobante emitido / Ticket
  ultimaVenta = signal<Venta | null>(null);
  modalTicketAbierto: boolean = false;

  cargando = signal<boolean>(false);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  constructor(
    private ventasService: VentasService,
    private catalogoService: CatalogoService,
    private inventarioService: InventarioService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando.set(true);

    // 1. Cargar turno de caja del usuario
    this.ventasService.obtenerMiTurno().subscribe({
      next: (turno) => {
        this.cajaActiva.set(turno);
        if (!turno) {
          this.cargarCajasDisponibles();
        }
      },
      error: () => this.cargarCajasDisponibles()
    });

    // 2. Cargar Catálogo de productos
    this.catalogoService.listarProductos(0, 100).subscribe({
      next: (resp) => {
        this.productos.set(resp.content || []);
      },
      error: () => {}
    });

    // 3. Cargar existencias de inventario
    this.inventarioService.listarStock().subscribe({
      next: (stocks) => {
        const map = new Map<number, number>();
        for (let s of stocks) {
          map.set(s.productoId, s.stockActual);
        }
        this.stockMap.set(map);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });

    // 4. Cargar cliente genérico por defecto
    this.ventasService.buscarClientePorDocumento('00000000').subscribe({
      next: (cli) => this.clienteSeleccionado.set(cli),
      error: () => {}
    });
  }

  cargarCajasDisponibles(): void {
    this.ventasService.listarCajas().subscribe({
      next: (cajas) => this.cajasDisponibles.set(cajas),
      error: () => {}
    });
  }

  // ==========================================
  // Filtros de Productos
  // ==========================================
  productosFiltrados(): Producto[] {
    const q = this.busquedaProducto.trim().toLowerCase();
    if (!q) return this.productos();
    return this.productos().filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.codigoBarras && p.codigoBarras.includes(q)) ||
      (p.principioActivo && p.principioActivo.toLowerCase().includes(q)) ||
      (p.laboratorio && p.laboratorio.nombre && p.laboratorio.nombre.toLowerCase().includes(q))
    );
  }

  obtenerStockProducto(productoId: number): number {
    return this.stockMap().get(productoId) || 0;
  }

  // ==========================================
  // Precios Fraccionados: Caja, Tableta, Unidad
  // ==========================================
  esMedicamentoOral(producto: Producto): boolean {
    const pres = (producto.presentacion || '').toLowerCase();
    const nom = (producto.nombre || '').toLowerCase();
    return pres.includes('tableta') || pres.includes('cápsula') || pres.includes('capsula') ||
           pres.includes('comprimido') || pres.includes('caja') || nom.includes('mg') || nom.includes('tab');
  }

  obtenerPrecioUnidad(producto: Producto): number {
    return Number(producto.precioVenta.toFixed(2));
  }

  obtenerPrecioTableta(producto: Producto): number {
    // 1 blíster / tableta = 10 unidades con 5% de descuento por volumen
    const precioBase = producto.precioVenta * 10;
    return Number((precioBase * 0.95).toFixed(2));
  }

  obtenerPrecioCaja(producto: Producto): number {
    // 1 caja = 100 unidades (o 10 blísteres) con 12% de descuento por volumen
    const precioBase = producto.precioVenta * 100;
    return Number((precioBase * 0.88).toFixed(2));
  }

  // ==========================================
  // Acciones del Carrito
  // ==========================================
  agregarAlCarrito(producto: Producto, fraccion: FraccionVenta = 'UNIDAD'): void {
    if (!this.cajaActiva()) {
      this.mostrarError('Debe abrir su turno de caja antes de realizar ventas.');
      this.abrirModalApertura();
      return;
    }

    const mult = fraccion === 'CAJA' ? 100 : (fraccion === 'TABLETA' ? 10 : 1);
    let precio = this.obtenerPrecioUnidad(producto);
    if (fraccion === 'TABLETA') precio = this.obtenerPrecioTableta(producto);
    if (fraccion === 'CAJA') precio = this.obtenerPrecioCaja(producto);

    const items = [...this.carrito()];
    // Buscar si ya existe la misma presentación para este producto
    const index = items.findIndex(it => it.producto.id === producto.id && it.fraccion === fraccion);

    // Stock total en almacén (en unidades)
    const stockActual = this.obtenerStockProducto(producto.id);
    
    // Total de unidades del producto ya comprometidas en el carrito
    const unidadesUsadas = items
      .filter(it => it.producto.id === producto.id)
      .reduce((sum, it) => sum + (it.cantidad * it.multiplicadorUnidades), 0);

    if (unidadesUsadas + mult > stockActual) {
      this.mostrarError(`Stock insuficiente para '${producto.nombre}'. Requiere ${unidadesUsadas + mult} unidades, pero solo hay ${stockActual} disponibles en almacén.`);
      return;
    }

    if (index >= 0) {
      items[index].cantidad += 1;
      items[index].subtotal = Number((items[index].cantidad * items[index].precioUnitario - items[index].descuento).toFixed(2));
    } else {
      items.push({
        producto,
        cantidad: 1,
        fraccion,
        multiplicadorUnidades: mult,
        precioUnitario: precio,
        descuento: 0,
        subtotal: precio
      });
    }

    // Nueva referencia para repetir el resaltado al agregar la misma presentación.
    const agregado = index >= 0 ? index : items.length - 1;
    items[agregado] = { ...items[agregado] };
    this.ultimoAgregado = items[agregado];
    this.carrito.set(items);
    this.recalcularTotales();
  }

  modificarCantidad(index: number, cambio: number): void {
    const items = [...this.carrito()];
    const item = items[index];
    const nuevaCant = item.cantidad + cambio;

    if (nuevaCant <= 0) {
      this.eliminarDelCarrito(index);
      return;
    }

    const stockActual = this.obtenerStockProducto(item.producto.id);
    const unidadesOtrasFilas = items
      .filter((it, idx) => it.producto.id === item.producto.id && idx !== index)
      .reduce((sum, it) => sum + (it.cantidad * it.multiplicadorUnidades), 0);

    const unidadesRequeridas = unidadesOtrasFilas + (nuevaCant * item.multiplicadorUnidades);
    if (unidadesRequeridas > stockActual) {
      this.mostrarError(`Stock insuficiente para '${item.producto.nombre}'. Requiere ${unidadesRequeridas} unidades y solo hay ${stockActual}.`);
      return;
    }

    item.cantidad = nuevaCant;
    item.subtotal = Number((item.cantidad * item.precioUnitario - item.descuento).toFixed(2));
    this.carrito.set(items);
    this.recalcularTotales();
  }

  cambiarFraccionItem(index: number, nuevaFraccion: FraccionVenta): void {
    const items = [...this.carrito()];
    const item = items[index];
    if (item.fraccion === nuevaFraccion) return;

    const mult = nuevaFraccion === 'CAJA' ? 100 : (nuevaFraccion === 'TABLETA' ? 10 : 1);
    let precio = this.obtenerPrecioUnidad(item.producto);
    if (nuevaFraccion === 'TABLETA') precio = this.obtenerPrecioTableta(item.producto);
    if (nuevaFraccion === 'CAJA') precio = this.obtenerPrecioCaja(item.producto);

    const stockActual = this.obtenerStockProducto(item.producto.id);
    const unidadesOtrasFilas = items
      .filter((it, idx) => it.producto.id === item.producto.id && idx !== index)
      .reduce((sum, it) => sum + (it.cantidad * it.multiplicadorUnidades), 0);

    const unidadesRequeridas = unidadesOtrasFilas + (item.cantidad * mult);
    if (unidadesRequeridas > stockActual) {
      this.mostrarError(`Stock insuficiente para cambiar a ${nuevaFraccion}. Se requerirían ${unidadesRequeridas} unidades pero hay ${stockActual}.`);
      return;
    }

    item.fraccion = nuevaFraccion;
    item.multiplicadorUnidades = mult;
    item.precioUnitario = precio;
    item.subtotal = Number((item.cantidad * item.precioUnitario - item.descuento).toFixed(2));
    this.carrito.set(items);
    this.recalcularTotales();
  }

  eliminarDelCarrito(index: number): void {
    const items = [...this.carrito()];
    items.splice(index, 1);
    this.carrito.set(items);
    this.recalcularTotales();
  }

  limpiarCarrito(): void {
    this.ultimoAgregado = null;
    this.carrito.set([]);
    this.cuponAplicado.set(null);
    this.cuponCodigo = '';
    this.descuentoManualPct = 0;
    this.montoRecibido = 0;
    this.observacionesVenta = '';
  }

  // ==========================================
  // Cálculos Financieros
  // ==========================================
  calcularTotalBruto(): number {
    return Number(this.carrito().reduce((sum, it) => sum + (it.precioUnitario * it.cantidad), 0).toFixed(2));
  }

  calcularDescuentoItems(): number {
    return Number(this.carrito().reduce((sum, it) => sum + it.descuento, 0).toFixed(2));
  }

  calcularDescuentoCupon(): number {
    const cupon = this.cuponAplicado();
    return cupon ? (cupon.montoDescuentoCalculado || 0) : 0;
  }

  calcularDescuentoManual(): number {
    if (this.descuentoManualPct <= 0) return 0;
    const base = this.calcularTotalBruto() - this.calcularDescuentoItems() - this.calcularDescuentoCupon();
    return Number(((base * this.descuentoManualPct) / 100).toFixed(2));
  }

  calcularTotalDescuento(): number {
    return Number((this.calcularDescuentoItems() + this.calcularDescuentoCupon() + this.calcularDescuentoManual()).toFixed(2));
  }

  calcularTotalPagar(): number {
    const total = this.calcularTotalBruto() - this.calcularTotalDescuento();
    return Number(Math.max(0, total).toFixed(2));
  }

  calcularBaseImponible(): number {
    return Number((this.calcularTotalPagar() / 1.18).toFixed(2));
  }

  calcularIgv(): number {
    return Number((this.calcularTotalPagar() - this.calcularBaseImponible()).toFixed(2));
  }

  calcularVuelto(): number {
    if (this.medioPago !== 'EFECTIVO') return 0;
    return Number(Math.max(0, (this.montoRecibido || 0) - this.calcularTotalPagar()).toFixed(2));
  }

  recalcularTotales(): void {
    if (this.medioPago === 'EFECTIVO' && this.montoRecibido < this.calcularTotalPagar()) {
      this.montoRecibido = this.calcularTotalPagar();
    }
    // Revalidar cupón si cambia el monto
    if (this.cuponAplicado() && this.cuponCodigo) {
      this.aplicarCupon();
    }
  }

  carritoTieneMedicamentosConReceta(): boolean {
    return this.carrito().some(it => it.producto.requiereReceta);
  }

  // ==========================================
  // Cliente
  // ==========================================
  alternarDni(): void {
    this.mostrarDni = !this.mostrarDni;
    if (!this.mostrarDni) {
      this.docBusqueda = '';
      this.clienteSeleccionado.set(null);
      this.seleccionarClienteGenerico();
    }
  }

  normalizarDocumento(): void {
    const longitud = this.tipoComprobante === 'FACTURA' ? 11 : 8;
    this.docBusqueda = this.docBusqueda.replace(/\D/g, '').slice(0, longitud);
  }

  documentoBusquedaValido(): boolean {
    return this.tipoComprobante === 'FACTURA'
      ? /^\d{11}$/.test(this.docBusqueda)
      : /^\d{8}$/.test(this.docBusqueda) && this.docBusqueda !== '00000000';
  }

  mensajeDocumento(): string {
    const factura = this.tipoComprobante === 'FACTURA';
    if (!factura && this.calcularTotalPagar() <= 700) return '';
    const cli = this.clienteSeleccionado();
    const valido = factura
      ? cli?.tipoDocumento === 'RUC' && /^\d{11}$/.test(cli.numeroDocumento)
      : cli?.tipoDocumento === 'DNI' && /^\d{8}$/.test(cli.numeroDocumento) && cli.numeroDocumento !== '00000000';
    if (valido) return '';
    return factura
      ? 'Busca y selecciona un cliente con RUC de 11 dígitos para emitir la factura.'
      : 'La boleta supera S/ 700. Valida un DNI de 8 dígitos para continuar.';
  }

  buscarCliente(): void {
    if (!this.documentoBusquedaValido()) return;
    const doc = this.docBusqueda.trim();
    if (!doc) return;

    this.ventasService.buscarClientePorDocumento(doc).subscribe({
      next: (cli) => {
        this.clienteSeleccionado.set(cli);
        this.mostrarExito(`Cliente encontrado: ${cli.nombresORazonSocial}`);
      },
      error: () => {
        this.nuevoClienteForm.numeroDocumento = doc;
        this.nuevoClienteForm.tipoDocumento = doc.length === 11 ? 'RUC' : 'DNI';
        this.modalNuevoClienteAbierto = true;
      }
    });
  }

  guardarNuevoCliente(): void {
    if (!this.nuevoClienteForm.numeroDocumento || !this.nuevoClienteForm.nombresORazonSocial) {
      this.mostrarError('Número de documento y nombres son obligatorios');
      return;
    }

    this.ventasService.crearCliente(this.nuevoClienteForm).subscribe({
      next: (cli) => {
        this.clienteSeleccionado.set(cli);
        this.modalNuevoClienteAbierto = false;
        this.mostrarExito(`Cliente registrado: ${cli.nombresORazonSocial}`);
      },
      error: (err) => this.mostrarError('Error al registrar cliente: ' + (err.error?.message || err.message))
    });
  }

  seleccionarClienteGenerico(): void {
    this.ventasService.buscarClientePorDocumento('00000000').subscribe({
      next: (cli) => this.clienteSeleccionado.set(cli)
    });
  }

  // ==========================================
  // Cupones y Promociones
  // ==========================================
  aplicarCupon(): void {
    const codigo = this.cuponCodigo.trim().toUpperCase();
    if (!codigo) return;

    // Regla de negocio: Medicamentos con receta están excluidos de cupones
    if (this.carritoTieneMedicamentosConReceta()) {
      this.mostrarError('Restricción sanitaria: Los medicamentos bajo receta médica están excluidos de promociones y cupones.');
      this.cuponAplicado.set(null);
      return;
    }

    const subtotalActual = this.calcularTotalBruto() - this.calcularDescuentoItems();

    this.ventasService.validarCupon({
      codigo,
      montoVenta: subtotalActual,
      productosIds: this.carrito().map(it => it.producto.id)
    }).subscribe({
      next: (resp) => {
        if (resp.valido) {
          this.cuponAplicado.set(resp);
          this.mostrarExito(resp.mensaje);
        } else {
          this.cuponAplicado.set(null);
          this.mostrarError(resp.mensaje);
        }
      },
      error: (err) => {
        this.cuponAplicado.set(null);
        this.mostrarError('Cupón inválido: ' + (err.error?.message || err.message));
      }
    });
  }

  quitarCupon(): void {
    this.cuponAplicado.set(null);
    this.cuponCodigo = '';
  }

  // ==========================================
  // Cobro y Emisión de Venta
  // ==========================================
  procesarCobro(): void {
    if (this.carrito().length === 0) {
      this.mostrarError('El carrito de compras está vacío');
      return;
    }

    if (!this.cajaActiva()) {
      this.mostrarError('Debe tener un turno de caja abierto para cobrar.');
      this.abrirModalApertura();
      return;
    }

    const errorDocumento = this.mensajeDocumento();
    if (errorDocumento) {
      this.mostrarError(errorDocumento);
      return;
    }

    const total = this.calcularTotalPagar();
    if (this.medioPago === 'EFECTIVO' && (this.montoRecibido || 0) < total) {
      this.mostrarError(`El efectivo entregado (S/ ${this.montoRecibido}) no cubre el total de la venta (S/ ${total})`);
      return;
    }

    // Validación de Crédito
    if (this.medioPago === 'CREDITO') {
      const cli = this.clienteSeleccionado();
      if (!cli || cli.numeroDocumento === '00000000') {
        this.mostrarError('Para ventas al crédito debe asignar un cliente con cuenta corriente registrada.');
        return;
      }
      if (this.creditoInsuficiente()) {
        this.mostrarError(`Límite de crédito excedido. Disponible: S/ ${this.creditoDisponibleCliente().toFixed(2)}, Monto: S/ ${total.toFixed(2)}`);
        return;
      }
    }

    // Validación de Factura con RUC
    if (this.tipoComprobante === 'FACTURA') {
      const cli = this.clienteSeleccionado();
      if (!cli || cli.tipoDocumento !== 'RUC' || cli.numeroDocumento.length !== 11) {
        this.mostrarError('Para emitir FACTURA debe asignar un cliente con RUC válido de 11 dígitos.');
        return;
      }
    }

    const request: RegistrarVentaRequest = {
      sucursalId: 1,
      sesionCajaId: this.cajaActiva()!.id,
      clienteId: this.clienteSeleccionado()?.id,
      tipoComprobante: this.tipoComprobante,
      medioPago: this.medioPago,
      montoRecibido: this.medioPago === 'EFECTIVO' ? this.montoRecibido : total,
      cuponId: this.cuponAplicado()?.cuponId,
      cuponCodigo: this.cuponCodigo ? this.cuponCodigo.trim().toUpperCase() : undefined,
      descuentoManual: this.calcularDescuentoManual(),
      observaciones: this.observacionesVenta,
      items: this.carrito().map(it => ({
        productoId: it.producto.id,
        cantidad: it.cantidad * it.multiplicadorUnidades,
        precioUnitario: Number((it.precioUnitario / it.multiplicadorUnidades).toFixed(4)),
        costoUnitario: it.producto.precioCosto || 0,
        descuento: it.descuento
      }))
    };

    this.cargando.set(true);
    this.ventasService.registrarVenta(request).subscribe({
      next: (venta) => {
        this.cargando.set(false);
        this.ultimaVenta.set(venta);
        this.modalTicketAbierto = true;
        this.limpiarCarrito();
        this.actualizarStockLocal(request.items);
        this.mostrarExito(`Venta registrada exitosamente con Comprobante ${venta.serieComprobante}-${venta.numeroComprobante}`);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('Error al registrar venta: ' + (err.error?.message || err.message));
      }
    });
  }

  actualizarStockLocal(items: ItemVentaRequest[]): void {
    const map = new Map(this.stockMap());
    for (let it of items) {
      const actual = map.get(it.productoId) || 0;
      map.set(it.productoId, Math.max(0, actual - it.cantidad));
    }
    this.stockMap.set(map);
  }

  // ==========================================
  // Ventas en Espera
  // ==========================================
  ponerEnEspera(): void {
    if (this.carrito().length === 0) {
      this.mostrarError('No hay productos en el carrito para poner en espera');
      return;
    }

    const datos = {
      carrito: this.carrito(),
      cliente: this.clienteSeleccionado(),
      tipoComprobante: this.tipoComprobante,
      medioPago: this.medioPago
    };

    const ref = prompt('Nombre o referencia para identificar la venta en espera:', 'Cliente Mostrador ' + new Date().toLocaleTimeString());
    if (!ref) return;

    this.cargando.set(true);
    this.ventasService.guardarVentaEspera({
      nombreReferencia: ref,
      datosJson: JSON.stringify(datos)
    }).subscribe({
      next: (espera) => {
        this.cargando.set(false);
        this.mostrarExito(`Venta puesta en espera [${espera.codigoEspera}]`);
        this.limpiarCarrito();
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('Error al guardar venta en espera: ' + (err.error?.message || err.message));
      }
    });
  }

  abrirModalVentasEspera(): void {
    this.ventasService.listarVentasEspera().subscribe({
      next: (lista) => {
        this.ventasEspera.set(lista);
        this.modalEsperaAbierto = true;
      },
      error: () => {}
    });
  }

  recuperarVentaEspera(ve: VentaEspera): void {
    try {
      const datos = JSON.parse(ve.datosJson);
      this.carrito.set(datos.carrito || []);
      if (datos.cliente) this.clienteSeleccionado.set(datos.cliente);
      if (datos.tipoComprobante) this.tipoComprobante = datos.tipoComprobante;
      if (datos.medioPago) this.medioPago = datos.medioPago;

      // Eliminar de espera
      this.ventasService.eliminarVentaEspera(ve.id).subscribe();
      this.modalEsperaAbierto = false;
      this.recalcularTotales();
      this.mostrarExito(`Venta [${ve.codigoEspera}] recuperada al carrito.`);
    } catch {
      this.mostrarError('Error al leer datos de la venta en espera');
    }
  }

  // ==========================================
  // Control de Caja y Turnos
  // ==========================================
  abrirModalApertura(): void {
    this.montoAperturaInput = 100.00;
    this.observacionesCajaInput = '';
    if (this.cajasDisponibles().length > 0) {
      this.cajaSeleccionadaId = this.cajasDisponibles()[0].id;
    }
    this.modalAperturaAbierto = true;
  }

  confirmarAperturaCaja(): void {
    if (this.cajasDisponibles().length === 0) {
      this.mostrarError('No hay cajas configuradas en la farmacia');
      return;
    }

    const cajaId = Number(this.cajaSeleccionadaId) || this.cajasDisponibles()[0].id;

    this.cargando.set(true);
    this.ventasService.aperturaCaja({
      cajaId,
      montoApertura: this.montoAperturaInput,
      observaciones: this.observacionesCajaInput
    }).subscribe({
      next: (sesion) => {
        this.cargando.set(false);
        this.cajaActiva.set(sesion);
        this.modalAperturaAbierto = false;
        this.mostrarExito(`Turno de ${sesion.nombreCaja} abierto con S/ ${sesion.montoApertura}`);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('Error al abrir caja: ' + (err.error?.message || err.message));
      }
    });
  }

  abrirModalCierre(): void {
    if (!this.cajaActiva()) return;
    this.ventasService.obtenerMiTurno().subscribe({
      next: (sesion) => {
        if (sesion) {
          this.cajaActiva.set(sesion);
          // Sugerir monto de cierre esperado
          const esperado = (sesion.montoApertura || 0) + (sesion.totalVentasEfectivo || 0);
          this.montoArqueoFisicoInput = esperado;
        }
        this.modalCierreAbierto = true;
      }
    });
  }

  confirmarCierreCaja(): void {
    const sesion = this.cajaActiva();
    if (!sesion) return;

    this.cargando.set(true);
    this.ventasService.cierreCaja(sesion.id, {
      montoCierreReal: this.montoArqueoFisicoInput,
      observaciones: this.observacionesCajaInput
    }).subscribe({
      next: (cerrada) => {
        this.cargando.set(false);
        this.cajaActiva.set(null);
        this.modalCierreAbierto = false;
        this.mostrarExito(
          `Caja cerrada exitosamente. Arqueo físico: S/ ${cerrada.montoCierreReal}. ` +
          `Diferencia: S/ ${cerrada.diferencia} (${cerrada.diferencia === 0 ? 'Conforme' : (cerrada.diferencia! > 0 ? 'Sobrante' : 'Faltante')}).`
        );
        this.cargarCajasDisponibles();
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('Error al cerrar caja: ' + (err.error?.message || err.message));
      }
    });
  }

  seleccionarMedioPagoCredito(): void {
    this.medioPago = 'CREDITO';
    const cli = this.clienteSeleccionado();
    if (!cli || cli.numeroDocumento === '00000000') {
      this.mostrarError('Para ventas al crédito debe buscar y seleccionar un cliente con línea de crédito habilitada.');
    }
  }

  creditoDisponibleCliente(): number {
    const cli = this.clienteSeleccionado();
    if (!cli) return 0;
    const limite = cli.limiteCredito || 0;
    const deuda = cli.saldoDeudor || 0;
    return Math.max(0, limite - deuda);
  }

  creditoInsuficiente(): boolean {
    if (this.medioPago !== 'CREDITO') return false;
    return this.calcularTotalPagar() > this.creditoDisponibleCliente();
  }

  obtenerQrUrl(): string {
    const v = this.ultimaVenta();
    if (v && (v as any).qrCodeUrl) return (v as any).qrCodeUrl;
    const ruc = '20601234567';
    const tipo = v?.tipoComprobante === 'FACTURA' ? '01' : '03';
    const serie = v?.serieComprobante || 'B001';
    const num = v?.numeroComprobante || '000001';
    const igv = (v?.igv || 0).toFixed(2);
    const total = (v?.total || 0).toFixed(2);
    const fecha = v?.fechaHora ? String(v.fechaHora).substring(0, 10) : new Date().toISOString().substring(0, 10);
    const cliDoc = v?.cliente?.numeroDocumento || '00000000';
    const cliTipo = v?.cliente?.tipoDocumento || 'DNI';
    const hash = (v as any)?.hashCpe || 'm8Qy/bT49jF71xR4w==';
    const qrData = `${ruc}|${tipo}|${serie}|${num}|${igv}|${total}|${fecha}|${cliTipo}|${cliDoc}|${hash}|`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
  }

  imprimirTicket(): void {
    window.print();
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
}
