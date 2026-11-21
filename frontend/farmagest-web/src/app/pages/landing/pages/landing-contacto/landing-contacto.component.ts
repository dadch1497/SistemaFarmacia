import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing-contacto.component.html',
  styleUrls: ['./landing-contacto.component.css']
})
export class LandingContactoComponent {
  contactoForm = {
    nombre: '',
    telefono: '',
    email: '',
    farmacia: '',
    mensaje: ''
  };
  contactoEnviado = false;

  enviarMensaje(): void {
    if (!this.contactoForm.nombre || !this.contactoForm.telefono) {
      alert('Por favor ingresa al menos tu nombre y número de teléfono.');
      return;
    }
    this.contactoEnviado = true;
    setTimeout(() => {
      this.contactoForm = {
        nombre: '',
        telefono: '',
        email: '',
        farmacia: '',
        mensaje: ''
      };
      this.contactoEnviado = false;
    }, 6000);
  }
}
