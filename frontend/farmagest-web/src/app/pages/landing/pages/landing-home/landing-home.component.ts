import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LandingDataService, ArticuloBlog } from '../../landing-data.service';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-home.component.html',
  styleUrls: ['./landing-home.component.css']
})
export class LandingHomeComponent {
  constructor(
    public landingData: LandingDataService,
    private router: Router
  ) {}

  get articulosRecientes(): ArticuloBlog[] {
    return this.landingData.articulos.slice(0, 3);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  abrirArticulo(art: ArticuloBlog): void {
    this.landingData.abrirArticulo(art);
  }
}
