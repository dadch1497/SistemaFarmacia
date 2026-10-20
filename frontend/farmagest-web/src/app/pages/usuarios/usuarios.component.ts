import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioDetalle, CrearUsuarioForm } from '../../core/models/auth.models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios = signal<UsuarioDetalle[]>([]);
  cargando = signal<boolean>(true);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  // Filtros
  filtroRol: string = 'TODOS';
  busqueda: string = '';

  // Modal para Nuevo Usuario
  modalNuevoUsuarioAbierto: boolean = false;
  guardandoUsuario: boolean = false;

  nuevoUsuario: CrearUsuarioForm = {
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    email: '',
    sucursalId: 1,
    rolIds: [2] // 2 = Vendedor por defecto
  };

  rolSeleccionadoId: number = 2; // 2: Vendedor, 3: Almacenero

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.limpiarMensajes();
    this.authService.listarUsuarios().subscribe({
      next: (resp) => {
        this.usuarios.set(resp.content || []);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('Error al cargar lista de usuarios: ' + (err.error?.message || err.message));
      }
    });
  }

  usuariosFiltrados(): UsuarioDetalle[] {
    return this.usuarios().filter(u => {
      // Filtrar administradores de la vista operativa si se desea enfocar en Vendedores y Almaceneros
      if (this.filtroRol !== 'TODOS') {
        if (!u.roles.includes(this.filtroRol)) return false;
      }

      if (this.busqueda.trim()) {
        const q = this.busqueda.trim().toLowerCase();
        const nom = `${u.nombres} ${u.apellidos}`.toLowerCase();
        const user = u.username.toLowerCase();
        const email = u.email.toLowerCase();
        if (!nom.includes(q) && !user.includes(q) && !email.includes(q)) return false;
      }

      return true;
    });
  }

  // Conteo de roles para KPIs
  contarVendedores(): number {
    return this.usuarios().filter(u => u.roles.includes('ROLE_VENDEDOR') && u.activo).length;
  }

  contarAlmaceneros(): number {
    return this.usuarios().filter(u => u.roles.includes('ROLE_ALMACENERO') && u.activo).length;
  }

  contarInactivos(): number {
    return this.usuarios().filter(u => !u.activo).length;
  }

  // ==========================================
  // Habilitar / Deshabilitar Acceso al Sistema
  // ==========================================
  alternarPermisoAcceso(u: UsuarioDetalle): void {
    const nuevoEstado = !u.activo;
    const accion = nuevoEstado ? 'dar permiso de acceso' : 'revocar el acceso';

    if (!confirm(`¿Está seguro de ${accion} al usuario '${u.username}' (${u.nombres} ${u.apellidos})?`)) {
      return;
    }

    this.cargando.set(true);
    this.authService.cambiarEstadoUsuario(u.id, nuevoEstado).subscribe({
      next: () => {
        this.cargando.set(false);
        this.mostrarExito(`Permiso actualizado: El usuario '${u.username}' ahora está ${nuevoEstado ? 'AUTORIZADO PARA INGRESAR' : 'BLOQUEADO / SIN ACCESO'}.`);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarError('No se pudo modificar el permiso de acceso: ' + (err.error?.message || err.message));
      }
    });
  }

  // ==========================================
  // Registro de Nuevo Vendedor o Almacenero
  // ==========================================
  abrirModalNuevoUsuario(rolPredeterminado: number = 2): void {
    this.rolSeleccionadoId = rolPredeterminado;
    this.nuevoUsuario = {
      username: '',
      password: '',
      nombres: '',
      apellidos: '',
      email: '',
      sucursalId: 1,
      rolIds: [rolPredeterminado]
    };
    this.modalNuevoUsuarioAbierto = true;
    this.limpiarMensajes();
  }

  cerrarModalNuevoUsuario(): void {
    this.modalNuevoUsuarioAbierto = false;
  }

  guardarNuevoUsuario(): void {
    if (!this.nuevoUsuario.username.trim() || !this.nuevoUsuario.password.trim() ||
        !this.nuevoUsuario.nombres.trim() || !this.nuevoUsuario.apellidos.trim() ||
        !this.nuevoUsuario.email.trim()) {
      this.mostrarError('Por favor complete todos los campos obligatorios del registro.');
      return;
    }

    this.nuevoUsuario.rolIds = [Number(this.rolSeleccionadoId)];
    this.guardandoUsuario = true;

    this.authService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (creado) => {
        this.guardandoUsuario = false;
        this.modalNuevoUsuarioAbierto = false;
        const nombreRol = this.rolSeleccionadoId === 2 ? 'Vendedor' : 'Almacenero';
        this.mostrarExito(`Nuevo ${nombreRol} '${creado.username}' registrado y habilitado exitosamente en el sistema.`);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardandoUsuario = false;
        this.mostrarError('Error al registrar usuario: ' + (err.error?.message || err.message));
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
