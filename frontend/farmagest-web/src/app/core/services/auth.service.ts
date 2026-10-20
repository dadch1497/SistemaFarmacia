import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioInfo, UsuarioDetalle, CrearUsuarioForm } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'farmagest_token';
  private readonly USER_KEY = 'farmagest_user';

  // Signals reactivas de Angular
  private currentUserSignal = signal<UsuarioInfo | null>(this.getStoredUser());
  public currentUser = computed(() => this.currentUserSignal());
  public isAuthenticated = computed(() => !!this.currentUserSignal() && !!this.getToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.usuario));
        this.currentUserSignal.set(res.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): UsuarioInfo | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioInfo;
    } catch {
      return null;
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSignal();
    return !!user && user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSignal();
    return !!user && roles.some(r => user.roles.includes(r));
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSignal();
    return !!user && user.permisos.includes(permission);
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMINISTRADOR');
  }

  isVendedor(): boolean {
    return this.hasRole('ROLE_VENDEDOR');
  }

  isAlmacenero(): boolean {
    return this.hasRole('ROLE_ALMACENERO');
  }

  // ==========================================
  // Gestión de Usuarios y Permisos (Solo Admin)
  // ==========================================
  listarUsuarios(query?: string): Observable<{ content: UsuarioDetalle[] }> {
    let url = `${this.apiUrl}/usuarios?size=50`;
    if (query && query.trim()) {
      url += `&q=${encodeURIComponent(query.trim())}`;
    }
    return this.http.get<{ content: UsuarioDetalle[] }>(url);
  }

  crearUsuario(request: CrearUsuarioForm): Observable<UsuarioDetalle> {
    return this.http.post<UsuarioDetalle>(`${this.apiUrl}/usuarios`, request);
  }

  cambiarEstadoUsuario(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/usuarios/${id}/estado`, { activo });
  }

  darDeBajaUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }
}
