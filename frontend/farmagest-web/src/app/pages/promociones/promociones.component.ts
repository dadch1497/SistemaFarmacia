import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../core/services/ventas.service';
import { AuthService } from '../../core/services/auth.service';
import { Promocion, CrearPromocionForm } from '../../core/models/ventas.models';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promociones.component.html',
  styleUrls: ['./promociones.component.css']
})
export class PromocionesComponent implements OnInit {

  promociones = signal<Promocion[]>([]);
  cargando = signal<boolean>(true);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  // Filtros
  filtroEstado: string = 'TODAS';
  busqueda: string = '';

  // Modal para Nueva Promoción
  modalNuevaPromoAbierto: boolean = false;
  guardandoPromo: boolean = false;

  nuevaPromo: CrearPromocionForm = {
    nombre: '',
    tipoAlcance: 'POR_PRODUCTO',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 15,
    cantidadCondicion: 2,
    cantidadPagada: 1,
    fechaInicio: new Date().toISOString().substring(0, 10),
    fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().substring(0, 10),
    aplicaPorVencimiento: false
  };

  constructor(
    private ventasService: VentasService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones(): void {
    this.cargando.set(true);
    this.limpiarMensajes();
    this.ventasService.listarPromociones().subscribe({
      next: (data) => {
        this.promociones.set(data || []);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('Error al cargar promociones: ' + (err.error?.message || err.message));
      }
    });
  }

  promocionesFiltradas(): Promocion[] {
    return this.promociones().filter(p => {
      if (this.filtroEstado === 'ACTIVAS' && !p.activo) return false;
      if (this.filtroEstado === 'PAUSADAS' && p.activo) return false;

      if (this.busqueda.trim()) {
        const q = this.busqueda.trim().toLowerCase();
        if (!p.nombre.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  // Métricas
  contarActivas(): number {
    return this.promociones().filter(p => p.activo).length;
  }

  contarPorVencimiento(): number {
    return this.promociones().filter(p => p.aplicaPorVencimiento && p.activo).length;
  }

  // ==========================================
  // Cambiar Estado (Pausar / Activar Promoción)
  // ==========================================
  alternarEstadoPromocion(p: Promocion): void {
    const nuevoEstado = !p.activo;
    const accion = nuevoEstado ? 'activar' : 'pausar';

    if (!confirm(`¿Desea ${accion} la promoción '${p.nombre}' para las ventas del POS?`)) {
      return;
    }

    this.cargando.set(true);
    this.ventasService.cambiarEstadoPromocion(p.id, nuevoEstado).subscribe({
      next: () => {
        this.cargando.set(false);
        this.mostrarExito(`La promoción ha sido ${nuevoEstado ? 'ACTIVADA y los clientes ya pueden aprovecharla' : 'PAUSADA'}.`);
        this.cargarPromociones();
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('Error al cambiar estado de la promoción: ' + (err.error?.message || err.message));
      }
    });
  }

  // ==========================================
  // Modal Crear Promoción
  // ==========================================
  abrirModalNuevaPromo(): void {
    this.nuevaPromo = {
      nombre: '',
      tipoAlcance: 'POR_PRODUCTO',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 15,
      cantidadCondicion: 2,
      cantidadPagada: 1,
      fechaInicio: new Date().toISOString().substring(0, 10),
      fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().substring(0, 10),
      aplicaPorVencimiento: false
    };
    this.modalNuevaPromoAbierto = true;
    this.limpiarMensajes();
  }

  cerrarModalNuevaPromo(): void {
    this.modalNuevaPromoAbierto = false;
  }

  guardarNuevaPromocion(): void {
    if (!this.nuevaPromo.nombre.trim()) {
      this.mostrarError('Ingrese un nombre descriptivo para la promoción comercial.');
      return;
    }

    if (!this.nuevaPromo.fechaInicio || !this.nuevaPromo.fechaFin) {
      this.mostrarError('Indique la vigencia (fecha de inicio y fecha de fin) de la promoción.');
      return;
    }

    this.guardandoPromo = true;
    this.ventasService.crearPromocion(this.nuevaPromo).subscribe({
      next: (creada) => {
        this.guardandoPromo = false;
        this.modalNuevaPromoAbierto = false;
        this.mostrarExito(`Promoción comercial '${creada.nombre}' creada con éxito. Ya está disponible para aplicarse a las compras de los clientes.`);
        this.cargarPromociones();
      },
      error: (err) => {
        this.guardandoPromo = false;
        this.mostrarError('Error al crear promoción: ' + (err.error?.message || err.message));
      }
    });
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
