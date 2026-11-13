import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { PosComponent } from './pages/pos/pos.component';
import { reportesRoleGuard } from './core/guards/reportes-role.guard';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { PromocionesComponent } from './pages/promociones/promociones.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { DevolucionesComponent } from './pages/devoluciones/devoluciones.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HomeComponent },
      { path: 'pos', component: PosComponent },
      { path: 'devoluciones', component: DevolucionesComponent, canActivate: [reportesRoleGuard], data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'] } },
      { path: 'notas-credito', redirectTo: 'devoluciones', pathMatch: 'full' },
      { path: 'devolucion', redirectTo: 'devoluciones', pathMatch: 'full' },
      { path: 'devolucion-ventas', redirectTo: 'devoluciones', pathMatch: 'full' },
      { path: 'devoluciones-ventas', redirectTo: 'devoluciones', pathMatch: 'full' },
      { path: 'pos/mis-ventas', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'productos', component: ProductosComponent },
      { path: 'productos/consulta', component: ProductosComponent },
      { path: 'inventario', component: InventarioComponent, canActivate: [reportesRoleGuard], data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR'] } },
      { path: 'inventario/alertas', component: InventarioComponent, canActivate: [reportesRoleGuard], data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR'] } },
      { path: 'compras', component: ComprasComponent, canActivate: [reportesRoleGuard], data: { roles: ['ROLE_ADMINISTRADOR'] } },
      { path: 'compras/ingreso', component: ComprasComponent, canActivate: [reportesRoleGuard], data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO'] } },
      { path: 'proveedores', component: ComprasComponent, canActivate: [reportesRoleGuard], data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO'] } },
      { path: 'promociones', component: PromocionesComponent },
      { path: 'reportes', component: ReportesComponent, canActivate: [reportesRoleGuard], data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR'] } },
      { path: 'usuarios', component: UsuariosComponent }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
