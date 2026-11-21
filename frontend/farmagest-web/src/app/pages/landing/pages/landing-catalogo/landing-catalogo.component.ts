import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LandingDataService, MedicamentoLanding } from '../../landing-data.service';

@Component({
  selector: 'app-landing-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing-catalogo.component.html',
  styleUrls: ['./landing-catalogo.component.css']
})
export class LandingCatalogoComponent {
  filtroTexto = '';
  categoriaSeleccionada = 'TODOS';

  constructor(public landingData: LandingDataService) {}

  get categorias() {
    return this.landingData.categorias;
  }

  get productosFiltrados(): MedicamentoLanding[] {
    return this.landingData.medicamentos.filter((m: MedicamentoLanding) => {
      const coincideCat = this.categoriaSeleccionada === 'TODOS' || m.categoria === this.categoriaSeleccionada;
      const texto = this.filtroTexto.toLowerCase().trim();
      const coincideTexto = !texto ||
        m.nombre.toLowerCase().includes(texto) ||
        m.principioActivo.toLowerCase().includes(texto) ||
        m.laboratorio.toLowerCase().includes(texto);
      return coincideCat && coincideTexto;
    });
  }

  seleccionarCategoria(catId: string): void {
    this.categoriaSeleccionada = catId;
  }

  solicitarPorWhatsapp(producto: MedicamentoLanding): void {
    this.landingData.solicitarPorWhatsapp(producto);
  }
}
