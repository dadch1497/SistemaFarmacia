import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  titulo: string;
  ruta: string;
  icono: string;
  roles: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  sidebarAbierto = typeof window !== 'undefined' ? window.innerWidth > 992 : false;
  fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  menuPrincipal: MenuItem[] = [
    { titulo: 'Dashboard', ruta: '/dashboard', icono: 'grid', roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'] },
    { titulo: 'Ventas (POS)', ruta: '/pos', icono: 'shopping-cart', roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'] },
    { titulo: 'Devolución de ventas con notas crédito', ruta: '/devoluciones', icono: 'rotate-ccw', roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'] },
    { titulo: 'Productos', ruta: '/productos', icono: 'package', roles: ['ROLE_ADMINISTRADOR'] },
    { titulo: 'Consultar stock', ruta: '/productos/consulta', icono: 'search', roles: ['ROLE_VENDEDOR'] },
    { titulo: 'Gestión de inventario y control de lotes', ruta: '/inventario', icono: 'layers', roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR'] },
    { titulo: 'Ingreso mercadería', ruta: '/compras/ingreso', icono: 'arrow-down-circle', roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO'] },
    { titulo: 'Compras', ruta: '/compras', icono: 'truck', roles: ['ROLE_ADMINISTRADOR'] },
    { titulo: 'Proveedores', ruta: '/proveedores', icono: 'briefcase', roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO'] },
    { titulo: 'Promociones', ruta: '/promociones', icono: 'tag', roles: ['ROLE_ADMINISTRADOR'] },
    { titulo: 'Reportes de ventas', ruta: '/reportes', icono: 'bar-chart-2', roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'] },
    { titulo: 'Alertas vencimiento', ruta: '/inventario/alertas', icono: 'alert-triangle', roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR'] }
  ];

  menuSistema: MenuItem[] = [
    { titulo: 'Usuarios y roles', ruta: '/usuarios', icono: 'user-check', roles: ['ROLE_ADMINISTRADOR'] }
  ];

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebarEnMovil(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      this.sidebarAbierto = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  puedeVer(item: MenuItem): boolean {
    return this.authService.hasAnyRole(item.roles);
  }

  obtenerTextoRol(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    if (user.roles.includes('ROLE_ADMINISTRADOR')) return 'Administrador · Acceso total';
    if (user.roles.includes('ROLE_VENDEDOR')) return `${user.nombres} · Rol: Vendedor`;
    if (user.roles.includes('ROLE_ALMACENERO')) return `${user.nombres} · Rol: Almacenero`;
    return user.username;
  }
}
