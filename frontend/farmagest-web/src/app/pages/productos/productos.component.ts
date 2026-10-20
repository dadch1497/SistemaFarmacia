import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../core/services/catalogo.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Producto,
  Categoria,
  Laboratorio,
  HistorialPrecio,
  CrearProductoRequest,
  CambiarPrecioRequest
} from '../../core/models/catalogo.models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  // Estado reactivo
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  laboratorios = signal<Laboratorio[]>([]);
  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  // Filtros
  filtroTexto: string = '';
  categoriaSeleccionadaId: number | null = null;
  filtroReceta: string = 'TODOS'; // 'TODOS' | 'CON_RECETA' | 'VENTA_LIBRE'
  paginaActual: number = 0;
  totalPaginas: number = 0;
  totalElementos: number = 0;
  tamanioPagina: number = 10;

  // Modales
  modalPrecioAbierto = false;
  modalHistorialAbierto = false;
  modalNuevoAbierto = false;

  productoSeleccionado: Producto | null = null;
  historialPrecios: HistorialPrecio[] = [];

  // Formulario Cambio de Precio
  cambioPrecioForm: CambiarPrecioRequest = {
    nuevoPrecioVenta: 0,
    nuevoPrecioCosto: undefined,
    motivo: ''
  };

  // Formulario Nuevo Producto
  nuevoProductoForm: CrearProductoRequest = {
    codigoBarras: '',
    nombre: '',
    principioActivo: '',
    concentracion: '',
    presentacion: 'Caja x 30 tabletas',
    categoriaId: 1,
    laboratorioId: 1,
    precioVenta: 0,
    precioCosto: 0,
    requiereReceta: false
  };

  constructor(
    public catalogoService: CatalogoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarLaboratorios();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.catalogoService.listarCategorias().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Error cargando categorias', err)
    });
  }

  cargarLaboratorios(): void {
    this.catalogoService.listarLaboratorios().subscribe({
      next: (data) => this.laboratorios.set(data),
      error: (err) => console.error('Error cargando laboratorios', err)
    });
  }

  cargarProductos(page: number = 0): void {
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.paginaActual = page;

    let requiereReceta: boolean | undefined = undefined;
    if (this.filtroReceta === 'CON_RECETA') requiereReceta = true;
    if (this.filtroReceta === 'VENTA_LIBRE') requiereReceta = false;

    this.catalogoService.listarProductos(
      this.paginaActual,
      this.tamanioPagina,
      this.filtroTexto,
      this.categoriaSeleccionadaId || undefined,
      undefined,
      requiereReceta
    ).subscribe({
      next: (res) => {
        this.productos.set(res.content);
        this.totalPaginas = res.totalPages;
        this.totalElementos = res.totalElements;
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo conectar con el catálogo de productos.');
      }
    });
  }

  buscar(): void {
    this.cargarProductos(0);
  }

  seleccionarCategoria(id: number | null): void {
    this.categoriaSeleccionadaId = id;
    this.cargarProductos(0);
  }

  filtrarPorReceta(valor: string): void {
    this.filtroReceta = valor;
    this.cargarProductos(0);
  }

  // --- Modal Cambiar Precio ---
  abrirModalPrecio(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.cambioPrecioForm = {
      nuevoPrecioVenta: producto.precioVenta,
      nuevoPrecioCosto: producto.precioCosto || undefined,
      motivo: ''
    };
    this.modalPrecioAbierto = true;
  }

  cerrarModalPrecio(): void {
    this.modalPrecioAbierto = false;
    this.productoSeleccionado = null;
  }

  guardarCambioPrecio(): void {
    if (!this.productoSeleccionado) return;
    if (this.cambioPrecioForm.nuevoPrecioVenta <= 0) {
      alert('El precio de venta debe ser mayor a 0');
      return;
    }
    if (!this.cambioPrecioForm.motivo.trim()) {
      alert('Debe especificar un motivo para la auditoría de cambio de precio');
      return;
    }

    this.cargando.set(true);
    this.catalogoService.cambiarPrecio(this.productoSeleccionado.id, this.cambioPrecioForm).subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarModalPrecio();
        this.mostrarExito('Precio actualizado exitosamente y notificado a RabbitMQ.');
        this.cargarProductos(this.paginaActual);
      },
      error: (err) => {
        this.cargando.set(false);
        alert(err.error?.detail || 'Error al actualizar precio.');
      }
    });
  }

  // --- Modal Historial ---
  abrirModalHistorial(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.catalogoService.obtenerHistorialPrecios(producto.id).subscribe({
      next: (hist) => {
        this.historialPrecios = hist;
        this.modalHistorialAbierto = true;
      },
      error: (err) => alert('No se pudo obtener el historial de precios.')
    });
  }

  cerrarModalHistorial(): void {
    this.modalHistorialAbierto = false;
    this.productoSeleccionado = null;
    this.historialPrecios = [];
  }

  // --- Modal Nuevo Producto ---
  abrirModalNuevo(): void {
    this.nuevoProductoForm = {
      codigoBarras: '',
      nombre: '',
      principioActivo: '',
      concentracion: '',
      presentacion: 'Caja x 30 tabletas',
      categoriaId: this.categorias()[0]?.id || 1,
      laboratorioId: this.laboratorios()[0]?.id || 1,
      precioVenta: 0,
      precioCosto: 0,
      requiereReceta: false
    };
    this.modalNuevoAbierto = true;
  }

  cerrarModalNuevo(): void {
    this.modalNuevoAbierto = false;
  }

  guardarNuevoProducto(): void {
    if (!this.nuevoProductoForm.nombre.trim() || !this.nuevoProductoForm.codigoBarras.trim()) {
      alert('El código de barras y el nombre son obligatorios');
      return;
    }
    if (this.nuevoProductoForm.precioVenta <= 0 || this.nuevoProductoForm.precioCosto <= 0) {
      alert('Los precios deben ser mayores a 0');
      return;
    }

    this.cargando.set(true);
    this.catalogoService.crearProducto(this.nuevoProductoForm).subscribe({
      next: () => {
        this.cargando.set(false);
        this.cerrarModalNuevo();
        this.mostrarExito('Producto registrado satisfactoriamente en el catálogo.');
        this.cargarProductos(0);
      },
      error: (err) => {
        this.cargando.set(false);
        alert(err.error?.detail || 'Error al crear producto');
      }
    });
  }

  // --- Alternar Estado Activo / Inactivo ---
  toggleEstado(producto: Producto): void {
    const accion = producto.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${accion} el producto "${producto.nombre}"?`)) return;

    this.catalogoService.cambiarEstado(producto.id, !producto.activo).subscribe({
      next: () => {
        this.mostrarExito(`Producto ${producto.activo ? 'desactivado' : 'activado'} correctamente.`);
        this.cargarProductos(this.paginaActual);
      },
      error: () => alert('Error al cambiar el estado del producto')
    });
  }

  mostrarExito(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => this.mensajeExito.set(null), 4000);
  }
}
