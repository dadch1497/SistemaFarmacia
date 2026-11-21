import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LandingDataService, MedicamentoLanding, ArticuloBlog } from '../../landing-data.service';

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

  get medicamentosDestacados(): MedicamentoLanding[] {
    return this.landingData.medicamentos.slice(0, 4);
  }

  get articulosRecientes(): ArticuloBlog[] {
    return this.landingData.articulos.slice(0, 3);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  solicitarWhatsapp(med: MedicamentoLanding): void {
    this.landingData.solicitarPorWhatsapp(med);
  }

  abrirArticulo(art: ArticuloBlog): void {
    this.landingData.abrirArticulo(art);
  }
}
