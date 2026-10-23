import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  cargando = signal<boolean>(false);
  errorMensaje = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMensaje.set('Por favor ingresa usuario y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');

    this.authService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.cdr.detectChanges();
        // Redirige según el rol principal
        if (res.usuario.roles.includes('ROLE_ADMINISTRADOR')) {
          this.router.navigate(['/dashboard']);
        } else if (res.usuario.roles.includes('ROLE_VENDEDOR')) {
          this.router.navigate(['/pos']);
        } else if (res.usuario.roles.includes('ROLE_ALMACENERO')) {
          this.router.navigate(['/inventario']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 401) {
          this.errorMensaje.set('Usuario o contraseña incorrectos. Verifica tus credenciales.');
        } else if (err.status === 0) {
          this.errorMensaje.set('No se pudo conectar con el servidor (Gateway / ms-auth).');
        } else {
          this.errorMensaje.set(err.error?.message || 'Error al iniciar sesión.');
        }
        this.cdr.detectChanges();
      }
    });
  }

  cargarCredencialDemo(user: string, pass: string): void {
    this.username = user;
    this.password = pass;
    this.errorMensaje.set('');
    this.cdr.detectChanges();
  }
}
