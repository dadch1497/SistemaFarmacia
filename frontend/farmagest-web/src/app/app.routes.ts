import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LandingHomeComponent } from './pages/landing/pages/landing-home/landing-home.component';
import { LandingCatalogoComponent } from './pages/landing/pages/landing-catalogo/landing-catalogo.component';
import { LandingModulosComponent } from './pages/landing/pages/landing-modulos/landing-modulos.component';
import { LandingNosotrosComponent } from './pages/landing/pages/landing-nosotros/landing-nosotros.component';
import { LandingBlogComponent } from './pages/landing/pages/landing-blog/landing-blog.component';
import { LandingContactoComponent } from './pages/landing/pages/landing-contacto/landing-contacto.component';
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
    path: '',
    component: LandingComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingHomeComponent },
      { path: 'inicio', redirectTo: '', pathMatch: 'full' },
      { path: 'catalogo', component: LandingCatalogoComponent },
      { path: 'catalogo-demo', redirectTo: 'catalogo', pathMatch: 'full' },
      { path: 'modulos', component: LandingModulosComponent },
      { path: 'modulos-soluciones', redirectTo: 'modulos', pathMatch: 'full' },
      { path: 'servicios', redirectTo: 'modulos', pathMatch: 'full' },
      { path: 'nosotros', component: LandingNosotrosComponent },
      { path: 'sobre-nosotros', redirectTo: 'nosotros', pathMatch: 'full' },
      { path: 'blog', component: LandingBlogComponent },
      { path: 'blog-novedades', redirectTo: 'blog', pathMatch: 'full' },
      { path: 'noticias', redirectTo: 'blog', pathMatch: 'full' },
      { path: 'contacto', component: LandingContactoComponent }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
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
