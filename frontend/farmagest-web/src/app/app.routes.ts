import { ConteoComponent } from './pages/conteo/conteo.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { PosComponent } from './pages/pos/pos.component';
import { ReporteInventarioComponent } from './pages/reporte-inventario/reporte-inventario.component';
import { reportesRoleGuard } from './core/guards/reportes-role.guard';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { PromocionesComponent } from './pages/promociones/promociones.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
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
      { path: 'pos/mis-ventas', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'productos', component: ProductosComponent },
      { path: 'productos/consulta', component: ProductosComponent },
      { path: 'inventario/conteos', component: ConteoComponent, canActivate:[reportesRoleGuard], data:{roles:['ROLE_ADMINISTRADOR','ROLE_ALMACENERO']} },
      { path: 'inventario', component: InventarioComponent },
      { path: 'inventario/alertas', component: InventarioComponent },
      { path: 'compras', component: ComprasComponent },
      { path: 'compras/ingreso', component: ComprasComponent },
      { path: 'proveedores', component: ComprasComponent },
      { path: 'promociones', component: PromocionesComponent },
      { path: 'reportes', component: ReportesComponent, canActivate:[reportesRoleGuard], data:{roles:['ROLE_ADMINISTRADOR']} },
      { path: 'reportes/inventario', component: ReporteInventarioComponent, canActivate:[reportesRoleGuard], data:{roles:['ROLE_ADMINISTRADOR','ROLE_ALMACENERO']} },
      { path: 'usuarios', component: UsuariosComponent }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
