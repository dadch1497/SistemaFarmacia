import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class LandingDataService {
  // Categorías de catálogo
  readonly categorias = [
    { id: 'TODOS', nombre: 'Todos los Productos' },
    { id: 'ANALGESICOS', nombre: 'Analgésicos y Antigripales' },
    { id: 'ANTIBIOTICOS', nombre: 'Antibióticos' },
    { id: 'GASTRO', nombre: 'Salud Gastrointestinal' },
    { id: 'VITAMINAS', nombre: 'Vitaminas y Defensas' },
    { id: 'CUIDADO', nombre: 'Cuidado Personal y Botiquín' }
  ];

  // Catálogo de medicamentos demo
  readonly medicamentos: MedicamentoLanding[] = [
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
  readonly articulos: ArticuloBlog[] = [
    {
      id: 1,
      titulo: 'Buenas Prácticas de Almacenamiento (BPA) y Trazabilidad DIGEMID en Boticas',
      resumen: 'Claves para superar inspecciones sanitarias y mantener control riguroso de lotes y vencimientos con software.',
      contenido: 'El control estricto de lotes y vencimientos no solo previene sanciones ante inspecciones de la DIRIS o DIGEMID, sino que evita pérdidas económicas críticas por mermas no detectadas. FarmaGest automatiza el registro de ingresos por lote, alertas tempranas de caducidad y generación de actas de mermas conforme a ley.',
      categoria: 'Regulación DIGEMID',
      fecha: '20 Noviembre, 2026',
      tiempoLectura: '4 min',
      autor: 'Área Técnica FarmaGest'
    },
    {
      id: 2,
      titulo: 'Facturación Electrónica SUNAT: Ventajas de la Emisión Inmediata en Mostrador',
      resumen: 'Cómo reducir tiempos de espera en el punto de venta emitiendo comprobantes válidos en segundos.',
      contenido: 'Contar con una integración directa y nativa con SUNAT elimina la lentitud en mostrador. FarmaGest emite boletas, facturas y notas de crédito instantáneas, almacenando de forma segura los archivos XML y CDR requeridos por la normativa tributaria peruana.',
      categoria: 'Gestión Tributaria',
      fecha: '18 Noviembre, 2026',
      tiempoLectura: '3 min',
      autor: 'Equipo Tributario FarmaGest'
    },
    {
      id: 3,
      titulo: 'Catálogo Digital y Portal para Clientes: El Futuro de la Farmacia Peruana',
      resumen: 'Por qué las boticas modernas necesitan una vitrina digital que sincronice stock y precios al instante.',
      contenido: 'Los usuarios actuales prefieren verificar disponibilidad, principios activos y precios antes de salir de casa o solicitar despacho. FarmaGest incluye un portal web interactivo que exhibe tu catálogo sin complicaciones operativas para el personal.',
      categoria: 'Tecnología & Ventas',
      fecha: '15 Noviembre, 2026',
      tiempoLectura: '5 min',
      autor: 'Equipo de Producto FarmaGest'
    }
  ];

  // Estado de modales compartidos
  modalArticuloAbierto = false;
  articuloSeleccionado: ArticuloBlog | null = null;
  modalTerminosAbierto = false;

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

  solicitarPorWhatsapp(producto: MedicamentoLanding): void {
    const texto = encodeURIComponent(`Hola FarmaGest, quisiera consultar la disponibilidad del producto: ${producto.nombre} (${producto.presentacion}) con precio referencial S/ ${producto.precioVenta.toFixed(2)}.`);
    window.open(`https://wa.me/51987654321?text=${texto}`, '_blank');
  }
}
