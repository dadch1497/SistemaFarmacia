import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export interface MedicamentoLanding {
  id: number;
  nombre: string;
  principioActivo: string;
  concentracion: string;
  presentacion: string;
  categoria: string;
  precioVenta: number;
  requiereReceta: boolean;
  laboratorio: string;
  disponible: boolean;
  icono: string;
}

export interface ArticuloBlog {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  categoria: string;
  fecha: string;
  tiempoLectura: string;
  autor: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  menuMovilAbierto = false;

  // Filtros de catálogo
  filtroTexto = '';
  categoriaSeleccionada = 'TODOS';

  // Categorías de muestra
  readonly categorias = [
    { id: 'TODOS', nombre: 'Todos los Productos' },
    { id: 'ANALGESICOS', nombre: 'Analgésicos y Antigripales' },
    { id: 'ANTIBIOTICOS', nombre: 'Antibióticos' },
    { id: 'GASTRO', nombre: 'Salud Gastrointestinal' },
    { id: 'VITAMINAS', nombre: 'Vitaminas y Defensas' },
    { id: 'CUIDADO', nombre: 'Cuidado Personal y Botiquín' }
  ];

  // Catálogo destacado de muestra para clientes
  medicamentos: MedicamentoLanding[] = [
    {
      id: 1,
      nombre: 'Paracetamol 500 mg',
      principioActivo: 'Paracetamol',
      concentracion: '500 mg',
      presentacion: 'Caja x 100 Tabletas',
      categoria: 'ANALGESICOS',
      precioVenta: 12.50,
      requiereReceta: false,
      laboratorio: 'Farmindustria',
      disponible: true,
      icono: 'pill'
    },
    {
      id: 2,
      nombre: 'Ibuprofeno 400 mg',
      principioActivo: 'Ibuprofeno',
      concentracion: '400 mg',
      presentacion: 'Caja x 20 Cápsulas Blandas',
      categoria: 'ANALGESICOS',
      precioVenta: 15.00,
      requiereReceta: false,
      laboratorio: 'Medifarma',
      disponible: true,
      icono: 'pill'
    },
    {
      id: 3,
      nombre: 'Amoxicilina + Ácido Clavulánico',
      principioActivo: 'Amoxicilina / Ac. Clavulánico',
      concentracion: '875 / 125 mg',
      presentacion: 'Caja x 14 Tabletas Recubiertas',
      categoria: 'ANTIBIOTICOS',
      precioVenta: 42.00,
      requiereReceta: true,
      laboratorio: 'Genfar',
      disponible: true,
      icono: 'prescription'
    },
    {
      id: 4,
      nombre: 'Omeprazol 20 mg',
      principioActivo: 'Omeprazol',
      concentracion: '20 mg',
      presentacion: 'Caja x 30 Cápsulas con Gránulos',
      categoria: 'GASTRO',
      precioVenta: 18.50,
      requiereReceta: false,
      laboratorio: 'Portugal',
      disponible: true,
      icono: 'capsule'
    },
    {
      id: 5,
      nombre: 'Vitamina C + Zinc Efervescente',
      principioActivo: 'Ácido Ascórbico + Zinc',
      concentracion: '1000 mg / 10 mg',
      presentacion: 'Tubo x 10 Tabletas Efervescentes',
      categoria: 'VITAMINAS',
      precioVenta: 24.00,
      requiereReceta: false,
      laboratorio: 'Bayer',
      disponible: true,
      icono: 'sun'
    },
    {
      id: 6,
      nombre: 'Alcohol Antiséptico 70°',
      principioActivo: 'Etanol 70%',
      concentracion: '70% v/v',
      presentacion: 'Frasco x 1000 ml',
      categoria: 'CUIDADO',
      precioVenta: 11.00,
      requiereReceta: false,
      laboratorio: 'Alkofarma',
      disponible: true,
      icono: 'shield'
    },
    {
      id: 7,
      nombre: 'Cetirizina 10 mg',
      principioActivo: 'Cetirizina Diclorhidrato',
      concentracion: '10 mg',
      presentacion: 'Caja x 10 Tabletas',
      categoria: 'ANALGESICOS',
      precioVenta: 9.80,
      requiereReceta: false,
      laboratorio: 'Medifarma',
      disponible: true,
      icono: 'pill'
    },
    {
      id: 8,
      nombre: 'Suero Rehidratante Oral Frutas',
      principioActivo: 'Sales de Rehidratación Oral',
      concentracion: 'Electrolitos balanceados',
      presentacion: 'Frasco x 500 ml',
      categoria: 'GASTRO',
      precioVenta: 8.50,
      requiereReceta: false,
      laboratorio: 'Laboratorios Bagó',
      disponible: true,
      icono: 'droplet'
    }
  ];

  // Artículos del Blog
  articulos: ArticuloBlog[] = [
    {
      id: 1,
      titulo: 'Uso Responsable de Antibióticos: Evitemos la Resistencia Bacteriana',
      resumen: 'Conoce por qué no debes suspender tu tratamiento antes de tiempo ni tomar antibióticos sin receta médica previa.',
      contenido: 'La resistencia bacteriana es una de las mayores amenazas de salud global. Tomar antibióticos para infecciones virales como el resfriado o suspender las tomas cuando los síntomas mejoran entrena a las bacterias para sobrevivir, inutilizando los tratamientos futuros. En FarmaGest promovemos la dispensación ética con receta médica.',
      categoria: 'Educación Sanitaria',
      fecha: '20 Noviembre, 2026',
      tiempoLectura: '4 min',
      autor: 'Dra. María Elena Rivas (Q.F.)'
    },
    {
      id: 2,
      titulo: 'Cómo Conservar tus Medicamentos en Casa de Manera Correcta',
      resumen: 'Consejos para proteger la efectividad de tus fármacos evitando el calor, la humedad del baño y la luz solar directa.',
      contenido: 'El botiquín del baño es uno de los peores lugares para guardar fármacos debido al vapor de la ducha y la humedad constante. Se recomienda un lugar fresco, seco y fuera del alcance de los niños, conservando siempre el empaque original y las fechas de vencimiento visibles.',
      categoria: 'Guía Práctica',
      fecha: '18 Noviembre, 2026',
      tiempoLectura: '3 min',
      autor: 'Lic. Carlos Torres (Farmacéutico)'
    },
    {
      id: 3,
      titulo: 'Guía de Recetas Médicas en el Perú: Todo lo que Debes Saber',
      resumen: 'Aprende a identificar los requisitos obligatorios de una receta médica válida según la normativa del MINSA y DIGEMID.',
      contenido: 'Una prescripción médica conforme a ley debe incluir: nombre completo del paciente, denominación común internacional (DCI), concentración, forma farmacéutica, dosis, firma, sello y número de colegiatura del médico tratante. Esto protege tu seguridad.',
      categoria: 'Normativa & Seguridad',
      fecha: '15 Noviembre, 2026',
      tiempoLectura: '5 min',
      autor: 'Equipo Técnico FarmaGest'
    }
  ];

  articuloSeleccionado: ArticuloBlog | null = null;
  modalArticuloAbierto = false;
  modalTerminosAbierto = false;

  // Formulario de Contacto
  contactoForm = {
    nombre: '',
    telefono: '',
    email: '',
    mensaje: ''
  };
  contactoEnviado = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  get productosFiltrados(): MedicamentoLanding[] {
    return this.medicamentos.filter(m => {
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
    const texto = encodeURIComponent(`Hola FarmaGest, quisiera consultar la disponibilidad del producto: ${producto.nombre} (${producto.presentacion}) con precio referencial S/ ${producto.precioVenta.toFixed(2)}.`);
    window.open(`https://wa.me/51987654321?text=${texto}`, '_blank');
  }

  abrirArticulo(art: ArticuloBlog): void {
    this.articuloSeleccionado = art;
    this.modalArticuloAbierto = true;
  }

  cerrarModalArticulo(): void {
    this.modalArticuloAbierto = false;
    this.articuloSeleccionado = null;
  }

  abrirTerminos(): void {
    this.modalTerminosAbierto = true;
  }

  cerrarTerminos(): void {
    this.modalTerminosAbierto = false;
  }

  enviarMensaje(): void {
    if (!this.contactoForm.nombre || !this.contactoForm.telefono) {
      alert('Por favor ingresa al menos tu nombre y número telefónico.');
      return;
    }
    this.contactoEnviado = true;
    setTimeout(() => {
      this.contactoForm = { nombre: '', telefono: '', email: '', mensaje: '' };
      this.contactoEnviado = false;
    }, 5000);
  }
}
