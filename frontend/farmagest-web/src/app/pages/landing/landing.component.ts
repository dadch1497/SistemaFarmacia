import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LandingDataService } from './landing-data.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LandingComponent {
  menuMovilAbierto = false;

  constructor(
    public landingData: LandingDataService,
    private router: Router
  ) {}

  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  irALogin(): void {
    this.cerrarMenuMovil();
    this.router.navigate(['/login']);
  }

  abrirTerminos(): void {
    this.landingData.abrirTerminos();
  }

  cerrarTerminos(): void {
    this.landingData.cerrarTerminos();
  }

  cerrarModalArticulo(): void {
    this.landingData.cerrarModalArticulo();
  }
}
