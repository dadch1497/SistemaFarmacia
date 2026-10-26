import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarcodePhotoComponent } from '../../shared/barcode-photo/barcode-photo.component';
import { ActivatedRoute } from '@angular/router';
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
  imports: [CommonModule, FormsModule, BarcodePhotoComponent],
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
  modalCargaMasivaAbierto = false;
  productosPrevisualizacion: any[] = [];
  errorCargaMasiva: string | null = null;

  productoSeleccionado: Producto | null = null;
  historialPrecios: HistorialPrecio[] = [];

  // Formulario Cambio de Precio
  cambioPrecioForm: CambiarPrecioRequest = {
    nuevoPrecioVenta: 0,
    nuevoPrecioCosto: undefined,
    motivo: ''
  };

  leyendoCodigo = false;
  tipoPresentacion = 'Unidad';
  detallePresentacion = '';
  readonly presentaciones = ['Unidad', 'Frasco', 'Botella', 'Tubo', 'Sobre', 'Caja', 'Blíster', 'Tableta', 'Cápsula', 'Otra'];

  actualizarPresentacion(): void {
    const detalle = this.detallePresentacion.trim();
    this.nuevoProductoForm.presentacion = this.tipoPresentacion === 'Otra'
      ? detalle : this.tipoPresentacion + (detalle ? ' · ' + detalle : '');
  }

  // Formulario Nuevo Producto
  nuevoProductoForm: CrearProductoRequest = {
    codigoBarras: '',
    nombre: '',
    principioActivo: '',
    concentracion: '',
    presentacion: 'Unidad',
    categoriaId: 1,
    laboratorioId: 1,
    precioVenta: 0,
    precioCosto: 0,
    requiereReceta: false
  };

  constructor(
    public catalogoService: CatalogoService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarLaboratorios();
    this.cargarProductos();
    const codigo = this.route.snapshot.queryParamMap.get('codigoBarras');
    if (this.authService.isAdmin() && codigo && codigo.length <= 128 && /^[\x20-\x7E]+$/.test(codigo)) {
      this.abrirModalNuevo();
      this.nuevoProductoForm.codigoBarras = codigo;
    }
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
    this.leyendoCodigo = false;
    this.tipoPresentacion = 'Unidad';
    this.detallePresentacion = '';
    this.nuevoProductoForm = {
      codigoBarras: '',
      nombre: '',
      principioActivo: '',
      concentracion: '',
      presentacion: 'Unidad',
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
    if (this.leyendoCodigo || this.cargando()) return;
    this.actualizarPresentacion();
    if (!this.nuevoProductoForm.presentacion.trim()) {
      alert('Especifica la presentación del producto');
      return;
    }
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

  abrirModalCargaMasiva(): void {
    this.productosPrevisualizacion = [];
    this.errorCargaMasiva = null;
    this.modalCargaMasivaAbierto = true;
  }

  cerrarModalCargaMasiva(): void {
    this.modalCargaMasivaAbierto = false;
    this.productosPrevisualizacion = [];
    this.errorCargaMasiva = null;
  }

  descargarPlantillaCsv(): void {
    const encabezados = 'codigoBarras,nombre,principioActivo,presentacion,categoria,precioCosto,precioVenta,requiereReceta,stockInicial,numeroLote,fechaVencimiento\n';
    const filasEjemplo = [
      '7750123456789,AMOXICILINA 500MG,Amoxicilina,Caja x 100 Cápsulas,ANTIBIOTICOS,12.50,22.00,true,50,LOTE-AMX-2026,2027-12-31',
      '7750987654321,PARACETAMOL 500MG,Paracetamol,Blíster x 10 Tabletas,ANALGESICOS,1.20,3.50,false,120,LOTE-PCT-2026,2028-06-30',
      '7751122334455,IBUPROFENO 400MG,Ibuprofeno,Caja x 20 Tabletas,ANALGESICOS,3.00,6.50,false,80,LOTE-IBU-2026,2027-09-15'
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(encabezados + filasEjemplo);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'plantilla_carga_masiva_medicamentos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onArchivoCsvSeleccionado(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.errorCargaMasiva = null;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const text: string = e.target.result;
        const lineas = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lineas.length < 2) {
          this.errorCargaMasiva = 'El archivo CSV debe contener al menos un registro además del encabezado.';
          return;
        }

        const items: any[] = [];
        for (let i = 1; i < lineas.length; i++) {
          const col = lineas[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (col.length < 7) continue;

          items.push({
            codigoBarras: col[0] || ('GEN-' + Math.floor(100000000 + Math.random() * 900000000)),
            nombre: col[1] || 'Medicamento Sin Nombre',
            principioActivo: col[2] || '',
            presentacion: col[3] || 'Unidad',
            categoria: col[4] || 'GENERAL',
            precioCosto: parseFloat(col[5]) || 1.0,
            precioVenta: parseFloat(col[6]) || 2.0,
            requiereReceta: col[7] === 'true' || col[7] === '1' || col[7] === 'SI',
            stockInicial: col[8] ? parseInt(col[8], 10) : 10,
            numeroLote: col[9] || ('LOT-' + new Date().getFullYear()),
            fechaVencimiento: col[10] || '2028-12-31'
          });
        }

        if (items.length === 0) {
          this.errorCargaMasiva = 'No se encontraron medicamentos válidos en el archivo seleccionado.';
          return;
        }

        this.productosPrevisualizacion = items;
      } catch (err: any) {
        this.errorCargaMasiva = 'Error al procesar el archivo CSV: ' + err.message;
      }
    };
    reader.readAsText(file);
  }

  confirmarCargaMasiva(): void {
    if (this.productosPrevisualizacion.length === 0) return;

    this.cargando.set(true);
    this.catalogoService.cargaMasiva(this.productosPrevisualizacion).subscribe({
      next: (res: any) => {
        this.cargando.set(false);
        this.cerrarModalCargaMasiva();
        this.mostrarExito(`Se importaron ${res.totalImportados || this.productosPrevisualizacion.length} medicamentos y lotes exitosamente.`);
        this.cargarProductos(0);
      },
      error: (err: any) => {
        this.cargando.set(false);
        this.errorCargaMasiva = err.error?.detail || err.error?.message || 'Error al ejecutar la carga masiva en el servidor.';
      }
    });
  }

  mostrarExito(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => this.mensajeExito.set(null), 4000);
  }
}
