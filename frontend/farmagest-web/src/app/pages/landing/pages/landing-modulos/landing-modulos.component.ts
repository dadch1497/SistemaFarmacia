import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-landing-modulos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-modulos.component.html',
  styleUrls: ['./landing-modulos.component.css']
})
export class LandingModulosComponent {
  constructor(private router: Router) {}

  irALogin(): void {
    this.router.navigate(['/login']);
  }
}
