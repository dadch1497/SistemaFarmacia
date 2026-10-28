/**
 * FarmaGest — Mock API Gateway & Microservices Server Completo
 * Emula el 100% de los endpoints consumidos por el Frontend Angular:
 * - ms-auth (login, perfil, gestión de usuarios)
 * - ms-catalogo (productos, categorías, laboratorios, cambios y trazabilidad de precios)
 * - ms-inventario (stock FEFO, semáforos, kardex, mermas, alertas de caducidad)
 * - ms-ventas (POS, boletas/facturas SUNAT, apertura/cierre/arqueo de caja, clientes, cupones, promociones, ventas en espera)
 * - ms-compras (proveedores, órdenes de compra, ingresos físicos con lote y vencimiento)
 * - ms-reportes (KPIs ejecutivos, comparativa semanal, auditoría inmutable)
 */

const http = require('http');
const url = require('url');

const PORT = 8080;

// Permisos según matriz de seguridad
const PERMISOS_ADMIN = [
  'VENTA_CREAR', 'VENTA_LISTAR_PROPIAS', 'VENTA_LISTAR_TODAS', 'VENTA_ANULAR', 'VENTA_DEVOLUCION', 'CUPON_APLICAR', 'DESCUENTO_AUTORIZAR',
  'CAJA_APERTURA', 'CAJA_CIERRE_PROPIO', 'CAJA_CIERRE_TODOS',
  'PRODUCTO_CONSULTAR', 'PRODUCTO_CREAR', 'PRODUCTO_EDITAR', 'PRODUCTO_PRECIO_CAMBIAR', 'COSTO_VER',
  'STOCK_CONSULTAR', 'STOCK_AJUSTAR', 'ALERTA_VENCIMIENTO_VER', 'KARDEX_CONSULTAR',
  'PROVEEDOR_GESTIONAR', 'ORDEN_COMPRA_GESTIONAR', 'MERCADERIA_INGRESAR',
  'CLIENTE_GESTIONAR', 'PROMOCION_GESTIONAR',
  'DASHBOARD_VER', 'REPORTES_VENTAS_VER', 'AUDITORIA_VER'
];

const PERMISOS_VENDEDOR = [
  'VENTA_CREAR', 'VENTA_LISTAR_PROPIAS', 'CUPON_APLICAR',
  'CAJA_APERTURA', 'CAJA_CIERRE_PROPIO',
  'PRODUCTO_CONSULTAR',
  'STOCK_CONSULTAR',
  'CLIENTE_GESTIONAR'
];

const PERMISOS_ALMACENERO = [
  'PRODUCTO_CONSULTAR', 'STOCK_CONSULTAR', 'STOCK_AJUSTAR', 'ALERTA_VENCIMIENTO_VER', 'KARDEX_CONSULTAR',
  'PROVEEDOR_GESTIONAR', 'ORDEN_COMPRA_GESTIONAR', 'MERCADERIA_INGRESAR'
];

// Usuarios maestros
let USUARIOS = {
  admin: {
    id: 1,
    username: 'admin',
    password: 'AdminSecure2026!',
    nombres: 'Administrador',
    apellidos: 'Farma Ochenta',
    email: 'admin@farmaochenta.pe',
    rolPrincipal: 'ROLE_ADMINISTRADOR',
    sucursalId: 1,
    roles: ['ROLE_ADMINISTRADOR'],
    permisos: PERMISOS_ADMIN,
    activo: true,
    creadoEn: '2026-01-01T08:00:00Z'
  },
  vendedor1: {
    id: 2,
    username: 'vendedor1',
    password: 'Vendedor1Secure2026!',
    nombres: 'Carlos',
    apellidos: 'Gómez Soto',
    email: 'carlos.gomez@farmaochenta.pe',
    rolPrincipal: 'ROLE_VENDEDOR',
    sucursalId: 1,
    roles: ['ROLE_VENDEDOR'],
    permisos: PERMISOS_VENDEDOR,
    activo: true,
    creadoEn: '2026-01-15T08:00:00Z'
  },
  vendedor2: {
    id: 3,
    username: 'vendedor2',
    password: 'Vendedor2Secure2026!',
    nombres: 'Lucía',
    apellidos: 'Morales Rivas',
    email: 'lucia.morales@farmaochenta.pe',
    rolPrincipal: 'ROLE_VENDEDOR',
    sucursalId: 1,
    roles: ['ROLE_VENDEDOR'],
    permisos: PERMISOS_VENDEDOR,
    activo: true,
    creadoEn: '2026-02-01T08:00:00Z'
  },
  almacenero: {
    id: 4,
    username: 'almacenero',
    password: 'AlmaceneroSecure2026!',
    nombres: 'Roberto',
    apellidos: 'Quispe Tello',
    email: 'roberto.quispe@farmaochenta.pe',
    rolPrincipal: 'ROLE_ALMACENERO',
    sucursalId: 1,
    roles: ['ROLE_ALMACENERO'],
    permisos: PERMISOS_ALMACENERO,
    activo: true,
    creadoEn: '2026-01-10T08:00:00Z'
  }
};

// Categorías
let CATEGORIAS = [
  { id: 1, nombre: 'Analgésicos', descripcion: 'Medicamentos para el alivio del dolor y fiebre', activo: true },
  { id: 2, nombre: 'Antibióticos', descripcion: 'Fármacos para combatir infecciones bacterianas', activo: true },
  { id: 3, nombre: 'Antialérgicos', descripcion: 'Antihistamínicos para alergias respiratorias y dérmicas', activo: true },
  { id: 4, nombre: 'Gastrointestinal', descripcion: 'Protectores gástricos, antiácidos y digestivos', activo: true },
  { id: 5, nombre: 'Vitaminas', descripcion: 'Suplementos nutricionales y multivitamínicos', activo: true },
  { id: 6, nombre: 'Cuidado personal', descripcion: 'Higiene, antisépticos y primeros auxilios', activo: true }
];

// Laboratorios
let LABORATORIOS = [
  { id: 1, nombre: 'Medifarma', paisOrigen: 'Perú', activo: true },
  { id: 2, nombre: 'Laboratorios Portugal', paisOrigen: 'Perú', activo: true },
  { id: 3, nombre: 'IQ Farma', paisOrigen: 'Perú', activo: true },
  { id: 4, nombre: 'Bayer', paisOrigen: 'Alemania', activo: true },
  { id: 5, nombre: 'Pfizer', paisOrigen: 'Estados Unidos', activo: true },
  { id: 6, nombre: 'Farmindustria', paisOrigen: 'Perú', activo: true }
];

// Historial de precios
let HISTORIAL_PRECIOS = [
  { id: 1, productoId: 1, nombreProducto: 'Paracetamol 500 mg', precioAnterior: 0.40, precioNuevo: 0.50, costoAnterior: 0.18, costoNuevo: 0.22, motivo: 'Ajuste anual por inflación del laboratorio', usuarioId: 1, fechaCambio: '2026-01-15T10:00:00Z' }
];

// Productos
let PRODUCTOS = [
  { id: 1, codigoBarras: '7751234567890', nombre: 'Paracetamol 500 mg', principioActivo: 'Paracetamol', concentracion: '500 mg', presentacion: 'Tableta', categoria: CATEGORIAS[0], laboratorio: LABORATORIOS[1], precioVenta: 0.50, precioCosto: 0.22, margenPorcentaje: 56.0, requiereReceta: false, activo: true, creadoEn: '2026-01-01T10:00:00Z' },
  { id: 2, codigoBarras: '7751234567891', nombre: 'Ibuprofeno 400 mg', principioActivo: 'Ibuprofeno', concentracion: '400 mg', presentacion: 'Tableta', categoria: CATEGORIAS[0], laboratorio: LABORATORIOS[0], precioVenta: 0.90, precioCosto: 0.40, margenPorcentaje: 55.5, requiereReceta: false, activo: true, creadoEn: '2026-01-01T10:00:00Z' },
  { id: 3, codigoBarras: '7751234567892', nombre: 'Amoxicilina 500 mg', principioActivo: 'Amoxicilina', concentracion: '500 mg', presentacion: 'Cápsula', categoria: CATEGORIAS[1], laboratorio: LABORATORIOS[5], precioVenta: 2.50, precioCosto: 1.20, margenPorcentaje: 52.0, requiereReceta: true, activo: true, creadoEn: '2026-01-01T10:00:00Z' },
  { id: 4, codigoBarras: '7751234567893', nombre: 'Loratadina 10 mg', principioActivo: 'Loratadina', concentracion: '10 mg', presentacion: 'Tableta', categoria: CATEGORIAS[2], laboratorio: LABORATORIOS[1], precioVenta: 0.70, precioCosto: 0.30, margenPorcentaje: 57.1, requiereReceta: false, activo: true, creadoEn: '2026-01-01T10:00:00Z' },
  { id: 5, codigoBarras: '7751234567894', nombre: 'Omeprazol 20 mg', principioActivo: 'Omeprazol', concentracion: '20 mg', presentacion: 'Cápsula', categoria: CATEGORIAS[3], laboratorio: LABORATORIOS[2], precioVenta: 1.50, precioCosto: 0.65, margenPorcentaje: 56.6, requiereReceta: false, activo: true, creadoEn: '2026-01-01T10:00:00Z' },
  { id: 6, codigoBarras: '7751234567895', nombre: 'Vitamina C 1 g', principioActivo: 'Ácido Ascórbico', concentracion: '1 g', presentacion: 'Tableta efervescente', categoria: CATEGORIAS[4], laboratorio: LABORATORIOS[3], precioVenta: 2.00, precioCosto: 0.90, margenPorcentaje: 55.0, requiereReceta: false, activo: true, creadoEn: '2026-01-01T10:00:00Z' },
  { id: 7, codigoBarras: '7751234567896', nombre: 'Alcohol 70° 250 ml', principioActivo: 'Alcohol Etílico 70°', concentracion: '70°', presentacion: 'Frasco 250 ml', categoria: CATEGORIAS[5], laboratorio: LABORATORIOS[1], precioVenta: 6.00, precioCosto: 3.80, margenPorcentaje: 36.6, requiereReceta: false, activo: true, creadoEn: '2026-01-01T10:00:00Z' }
];

// Stock por producto
let STOCK = [
  { id: 1, productoId: 1, sucursalId: 1, stockActual: 50, stockMinimo: 15, stockMaximo: 150, estadoStock: 'OPTIMO', actualizadoEn: '2026-10-24T00:00:00Z', nombreProducto: 'Paracetamol 500 mg', codigoBarras: '7751234567890', presentacion: 'Tableta' },
  { id: 2, productoId: 2, sucursalId: 1, stockActual: 80, stockMinimo: 20, stockMaximo: 200, estadoStock: 'OPTIMO', actualizadoEn: '2026-10-24T00:00:00Z', nombreProducto: 'Ibuprofeno 400 mg', codigoBarras: '7751234567891', presentacion: 'Tableta' },
  { id: 3, productoId: 3, sucursalId: 1, stockActual: 8, stockMinimo: 20, stockMaximo: 100, estadoStock: 'BAJO', actualizadoEn: '2026-10-24T00:00:00Z', nombreProducto: 'Amoxicilina 500 mg', codigoBarras: '7751234567892', presentacion: 'Cápsula' },
  { id: 4, productoId: 4, sucursalId: 1, stockActual: 120, stockMinimo: 25, stockMaximo: 300, estadoStock: 'OPTIMO', actualizadoEn: '2026-10-24T00:00:00Z', nombreProducto: 'Loratadina 10 mg', codigoBarras: '7751234567893', presentacion: 'Tableta' },
  { id: 5, productoId: 5, sucursalId: 1, stockActual: 40, stockMinimo: 15, stockMaximo: 100, estadoStock: 'OPTIMO', actualizadoEn: '2026-10-24T00:00:00Z', nombreProducto: 'Omeprazol 20 mg', codigoBarras: '7751234567894', presentacion: 'Cápsula' },
  { id: 6, productoId: 6, sucursalId: 1, stockActual: 60, stockMinimo: 20, stockMaximo: 150, estadoStock: 'OPTIMO', actualizadoEn: '2026-10-24T00:00:00Z', nombreProducto: 'Vitamina C 1 g', codigoBarras: '7751234567895', presentacion: 'Tableta efervescente' },
  { id: 7, productoId: 7, sucursalId: 1, stockActual: 200, stockMinimo: 50, stockMaximo: 500, estadoStock: 'OPTIMO', actualizadoEn: '2026-10-24T00:00:00Z', nombreProducto: 'Alcohol 70° 250 ml', codigoBarras: '7751234567896', presentacion: 'Frasco 250 ml' }
];

// Lotes FEFO
let LOTES = [
  { id: 1, productoId: 1, sucursalId: 1, numeroLote: 'L-2024-PAR', fechaVencimiento: '2027-06-30', cantidadInicial: 50, cantidadActual: 50, costoUnitario: 0.22, estado: 'DISPONIBLE', diasRestantes: 614, semaforoVencimiento: 'VERDE' },
  { id: 2, productoId: 2, sucursalId: 1, numeroLote: 'L-2024-IBU1', fechaVencimiento: '2026-11-15', cantidadInicial: 30, cantidadActual: 30, costoUnitario: 0.40, estado: 'DISPONIBLE', diasRestantes: 22, semaforoVencimiento: 'ROJO' },
  { id: 3, productoId: 2, sucursalId: 1, numeroLote: 'L-2025-IBU2', fechaVencimiento: '2027-05-20', cantidadInicial: 50, cantidadActual: 50, costoUnitario: 0.40, estado: 'DISPONIBLE', diasRestantes: 573, semaforoVencimiento: 'VERDE' },
  { id: 4, productoId: 3, sucursalId: 1, numeroLote: 'L-2024-AMX', fechaVencimiento: '2026-12-08', cantidadInicial: 50, cantidadActual: 8, costoUnitario: 1.20, estado: 'DISPONIBLE', diasRestantes: 45, semaforoVencimiento: 'AMARILLO' },
  { id: 5, productoId: 4, sucursalId: 1, numeroLote: 'L-2025-LOR', fechaVencimiento: '2027-10-24', cantidadInicial: 120, cantidadActual: 120, costoUnitario: 0.30, estado: 'DISPONIBLE', diasRestantes: 730, semaforoVencimiento: 'VERDE' },
  { id: 6, productoId: 5, sucursalId: 1, numeroLote: 'L-2024-OME', fechaVencimiento: '2027-01-08', cantidadInicial: 40, cantidadActual: 40, costoUnitario: 0.65, estado: 'DISPONIBLE', diasRestantes: 75, semaforoVencimiento: 'AMARILLO' },
  { id: 7, productoId: 6, sucursalId: 1, numeroLote: 'L-2025-VIT', fechaVencimiento: '2027-08-20', cantidadInicial: 60, cantidadActual: 60, costoUnitario: 0.90, estado: 'DISPONIBLE', diasRestantes: 665, semaforoVencimiento: 'VERDE' },
  { id: 8, productoId: 7, sucursalId: 1, numeroLote: 'L-2026-ALC', fechaVencimiento: '2028-10-14', cantidadInicial: 200, cantidadActual: 200, costoUnitario: 3.80, estado: 'DISPONIBLE', diasRestantes: 1086, semaforoVencimiento: 'VERDE' }
];

// Alertas de inventario
let ALERTAS = [
  { id: 1, productoId: 2, loteId: 2, numeroLote: 'L-2024-IBU1', sucursalId: 1, tipoAlerta: 'VENCIMIENTO_30_DIAS', mensaje: 'Lote L-2024-IBU1 de Ibuprofeno 400 mg vence en 22 días (Crítico FEFO)', nivelUrgencia: 3, atendida: false, fechaAlerta: '2026-10-24T00:00:00Z' },
  { id: 2, productoId: 3, loteId: 4, numeroLote: 'L-2024-AMX', sucursalId: 1, tipoAlerta: 'STOCK_MINIMO', mensaje: 'Stock de Amoxicilina 500 mg (8 un.) por debajo del mínimo de seguridad (20 un.)', nivelUrgencia: 2, atendida: false, fechaAlerta: '2026-10-24T00:00:00Z' },
  { id: 3, productoId: 5, loteId: 6, numeroLote: 'L-2024-OME', sucursalId: 1, tipoAlerta: 'VENCIMIENTO_90_DIAS', mensaje: 'Lote L-2024-OME de Omeprazol 20 mg vence en 75 días', nivelUrgencia: 1, atendida: false, fechaAlerta: '2026-10-24T00:00:00Z' }
];

// Cajas y sesiones
let CAJAS = [
  { id: 1, sucursalId: 1, nombre: 'Caja Principal POS 01', codigo: 'CAJA-01', activo: true },
  { id: 2, sucursalId: 1, nombre: 'Caja Rápida POS 02', codigo: 'CAJA-02', activo: true }
];

let SESION_CAJA_ACTUAL = {
  id: 1,
  cajaId: 1,
  nombreCaja: 'Caja Principal POS 01',
  codigoCaja: 'CAJA-01',
  usuarioId: 1,
  sucursalId: 1,
  montoApertura: 200.00,
  montoCierreSistema: null,
  montoCierreReal: null,
  diferencia: null,
  estado: 'ABIERTA',
  fechaApertura: new Date().toISOString(),
  observaciones: 'Turno activo para atención',
  totalVentasEfectivo: 350.00,
  totalVentasTarjeta: 220.00,
  totalVentasBilletera: 140.00,
  totalVentasGeneral: 710.00,
  cantidadTransacciones: 18
};

// Clientes
let CLIENTES = [
  { id: 1, tipoDocumento: 'DNI', numeroDocumento: '00000000', nombresORazonSocial: 'CLIENTE GENÉRICO / VARIOS', direccion: 'Mostrador Farmacia', telefono: '000000000', email: 'sin_correo@farmagest.pe', activo: true, limiteCredito: 0, saldoDeudor: 0, diasCredito: 0 },
  { id: 2, tipoDocumento: 'DNI', numeroDocumento: '10485923', nombresORazonSocial: 'Juan Carlos Pérez Morales', direccion: 'Jr. Las Begonias 342, Ate, Lima', telefono: '987654321', email: 'jperez@gmail.com', activo: true, limiteCredito: 1000.00, saldoDeudor: 120.00, diasCredito: 15 },
  { id: 3, tipoDocumento: 'DNI', numeroDocumento: '45892314', nombresORazonSocial: 'María Elena Flores Ramos', direccion: 'Av. José Carlos Mariátegui 128, Ate', telefono: '998877665', email: 'mflores@outlook.com', activo: true, limiteCredito: 500.00, saldoDeudor: 0.00, diasCredito: 15 },
  { id: 4, tipoDocumento: 'RUC', numeroDocumento: '20601234567', nombresORazonSocial: 'Botica Popular Ate S.A.C.', direccion: 'Av. Nicolás Ayllón 4500, Ate, Lima', telefono: '013567890', email: 'facturacion@boticapopular.pe', activo: true, limiteCredito: 5000.00, saldoDeudor: 850.00, diasCredito: 30 }
];

// Promociones y Cupones
let PROMOCIONES = [
  { id: 1, nombre: '10% de Descuento en Vitaminas', tipoAlcance: 'POR_CATEGORIA', tipoDescuento: 'PORCENTAJE', valorDescuento: 10.00, fechaInicio: '2026-01-01', fechaFin: '2027-12-31', aplicaPorVencimiento: false, activo: true },
  { id: 2, nombre: 'Promoción 2x1 en Paracetamol 500mg', tipoAlcance: 'POR_PRODUCTO', tipoDescuento: 'N_X_M', cantidadCondicion: 2, cantidadPagada: 1, fechaInicio: '2026-01-01', fechaFin: '2027-12-31', aplicaPorVencimiento: false, activo: true }
];

let CUPONES = [
  { id: 1, codigo: 'BIENVENIDA2026', porcentajeDescuento: 15.00, montoFijoDescuento: 0.00, usosPermitidos: 500, usosActuales: 12, fechaExpiracion: '2027-12-31', activo: true },
  { id: 2, codigo: 'FARMA10', porcentajeDescuento: 10.00, montoFijoDescuento: 0.00, usosPermitidos: 200, usosActuales: 45, fechaExpiracion: '2027-12-31', activo: true },
  { id: 3, codigo: 'BOTICA5', porcentajeDescuento: 5.00, montoFijoDescuento: 0.00, usosPermitidos: 1000, usosActuales: 80, fechaExpiracion: '2027-12-31', activo: true }
];

// Notas de Crédito Electrónicas (SUNAT Tipo 07)
let NOTAS_CREDITO = [
  {
    id: 1,
    sucursalId: 1,
    sesionCajaId: 1,
    ventaId: 1,
    tipoComprobanteModificado: 'BOLETA',
    serieComprobanteModificado: 'B001',
    numeroComprobanteModificado: '00001024',
    serieNotaCredito: 'BC01',
    numeroNotaCredito: '00000001',
    tipoNotaCredito: '07',
    descripcionTipoNotaCredito: 'Devolución por ítem',
    motivoSustento: 'Error en dosificación indicada por el médico, cambio de medicamento',
    cliente: {
      id: 2,
      tipoDocumento: 'DNI',
      numeroDocumento: '10485923',
      nombresORazonSocial: 'Juan Carlos Pérez Morales',
      direccion: 'Jr. Las Begonias 342, Ate, Lima'
    },
    fechaHora: '2026-10-24T10:15:00Z',
    subtotalDevuelto: 4.24,
    igvDevuelto: 0.76,
    totalDevuelto: 5.00,
    medioReembolso: 'EFECTIVO',
    reingresoStockRealizado: true,
    hashCpe: 'eWdlc3Qtbm90YS1jcmVkaXRvLWJjMDE=',
    qrCodeUrl: 'https://sunat.gob.pe/cpe?ruc=20601234567&tipo=07&serie=BC01&numero=00000001&monto=5.00&fecha=2026-10-24',
    estadoSunat: 'ACEPTADA',
    detalles: [
      {
        id: 1,
        detalleVentaId: 1,
        productoId: 1,
        nombreProducto: 'Paracetamol 500 mg',
        loteId: 1,
        numeroLote: 'L-2024-PAR',
        cantidadDevuelta: 10,
        precioUnitario: 0.50,
        subtotal: 5.00,
        reingresaAStock: true,
        motivoItem: 'Devolución en empaque sellado'
      }
    ]
  }
];

// Ventas en espera del POS
let VENTAS_ESPERA = [];

// Ventas completadas
let VENTAS = [
  {
    id: 1,
    sucursalId: 1,
    cajaId: 1,
    sesionCajaId: 1,
    usuarioId: 1,
    usuarioVendedorId: 1,
    vendedorNombre: 'Administrador Farma Ochenta',
    nombreVendedor: 'Administrador Farma Ochenta',
    cliente: CLIENTES[1],
    tipoComprobante: 'BOLETA',
    serieComprobante: 'B001',
    numeroComprobante: '00001024',
    subtotal: 27.54,
    montoDescuento: 0.00,
    descuentoTotal: 0.00,
    igv: 4.96,
    total: 32.50,
    medioPago: 'EFECTIVO',
    montoEfectivo: 50.00,
    montoRecibido: 50.00,
    montoVuelto: 17.50,
    vuelto: 17.50,
    estado: 'COMPLETADA',
    fechaHora: '2026-10-23T14:30:00Z',
    fechaVenta: '2026-10-23T14:30:00Z',
    detalles: [
      { id: 1, productoId: 1, nombreProducto: 'Paracetamol 500 mg', loteId: 1, numeroLote: 'L-2024-PAR', cantidad: 10, precioUnitario: 0.50, costoUnitario: 0.22, descuentoLinea: 0.00, subtotalLinea: 5.00 },
      { id: 2, productoId: 3, nombreProducto: 'Amoxicilina 500 mg', loteId: 4, numeroLote: 'L-2024-AMX', cantidad: 11, precioUnitario: 2.50, costoUnitario: 1.20, descuentoLinea: 0.00, subtotalLinea: 27.50 }
    ],
    items: [
      { id: 1, productoId: 1, nombreProducto: 'Paracetamol 500 mg', loteId: 1, numeroLote: 'L-2024-PAR', cantidad: 10, precioUnitario: 0.50, costoUnitario: 0.22, descuentoLinea: 0.00, subtotalLinea: 5.00 },
      { id: 2, productoId: 3, nombreProducto: 'Amoxicilina 500 mg', loteId: 4, numeroLote: 'L-2024-AMX', cantidad: 11, precioUnitario: 2.50, costoUnitario: 1.20, descuentoLinea: 0.00, subtotalLinea: 27.50 }
    ]
  },
  {
    id: 2,
    sucursalId: 1,
    cajaId: 1,
    sesionCajaId: 1,
    usuarioId: 1,
    usuarioVendedorId: 1,
    vendedorNombre: 'Administrador Farma Ochenta',
    nombreVendedor: 'Administrador Farma Ochenta',
    cliente: CLIENTES[3],
    tipoComprobante: 'FACTURA',
    serieComprobante: 'F001',
    numeroComprobante: '00000412',
    subtotal: 101.69,
    montoDescuento: 0.00,
    descuentoTotal: 0.00,
    igv: 18.31,
    total: 120.00,
    medioPago: 'TARJETA',
    montoRecibido: 120.00,
    vuelto: 0.00,
    estado: 'COMPLETADA',
    fechaHora: '2026-10-23T16:45:00Z',
    fechaVenta: '2026-10-23T16:45:00Z',
    detalles: [
      { id: 3, productoId: 7, nombreProducto: 'Alcohol 70° 250 ml', loteId: 8, numeroLote: 'L-2026-ALC', cantidad: 20, precioUnitario: 6.00, costoUnitario: 3.80, descuentoLinea: 0.00, subtotalLinea: 120.00 }
    ],
    items: [
      { id: 3, productoId: 7, nombreProducto: 'Alcohol 70° 250 ml', loteId: 8, numeroLote: 'L-2026-ALC', cantidad: 20, precioUnitario: 6.00, costoUnitario: 3.80, descuentoLinea: 0.00, subtotalLinea: 120.00 }
    ]
  }
];

// Proveedores
let PROVEEDORES = [
  { id: 1, ruc: '20100055230', razonSocial: 'Droguería Los Andes S.A.C.', nombreContacto: 'Juan Pérez', telefono: '01-456-7890', email: 'ventas@droguerialosandes.pe', direccion: 'Av. Elmer Faucett 1920, Callao', activo: true, creadoEn: '2026-01-01T00:00:00Z' },
  { id: 2, ruc: '20549812401', razonSocial: 'Distribuidora Farmacéutica del Perú S.A.', nombreContacto: 'María Rojas', telefono: '01-321-6540', email: 'pedidos@difarpe.com.pe', direccion: 'Av. Venezuela 2400, Lima', activo: true, creadoEn: '2026-01-01T00:00:00Z' },
  { id: 3, ruc: '20489123091', razonSocial: 'Consorcio Médico Quirúrgico S.R.L.', nombreContacto: 'Carlos Mendoza', telefono: '01-789-1234', email: 'contacto@consorciomedico.pe', direccion: 'Av. Javier Prado Este 4500, Ate', activo: true, creadoEn: '2026-01-01T00:00:00Z' }
];

// Órdenes de compra
let ORDENES = [
  {
    id: 1,
    numeroOrden: 'OC-2026-0001',
    proveedor: PROVEEDORES[0],
    sucursalId: 1,
    estado: 'APROBADA',
    subtotal: 100.00,
    igv: 18.00,
    total: 118.00,
    usuarioCreadorId: 1,
    fechaEmision: '2026-10-20T10:00:00Z',
    fechaEsperada: '2026-10-27T10:00:00Z',
    observaciones: 'Reposición urgente de stock de seguridad para Ate',
    detalles: [
      { id: 1, productoId: 3, nombreProducto: 'Amoxicilina 500 mg', cantidadSolicitada: 50, costoPactado: 1.10, subtotal: 55.00 },
      { id: 2, productoId: 2, nombreProducto: 'Ibuprofeno 400 mg', cantidadSolicitada: 100, costoPactado: 0.40, subtotal: 40.00 }
    ],
    items: [
      { id: 1, productoId: 3, nombreProducto: 'Amoxicilina 500 mg', cantidadSolicitada: 50, costoPactado: 1.10, subtotal: 55.00 },
      { id: 2, productoId: 2, nombreProducto: 'Ibuprofeno 400 mg', cantidadSolicitada: 100, costoPactado: 0.40, subtotal: 40.00 }
    ]
  }
];

// Ingresos de mercadería
let INGRESOS = [
  {
    id: 1,
    numeroGuia: 'GR-001-000452',
    numeroFacturaProveedor: 'F001-0002130',
    ordenCompraId: 1,
    numeroOrdenCompra: 'OC-2026-0001',
    sucursalId: 1,
    usuarioRecepcionId: 1,
    fechaRecepcion: '2026-10-22T11:00:00Z',
    fechaIngreso: '2026-10-22T11:00:00Z',
    observaciones: 'Recepción conforme en almacén central',
    detalles: [
      { id: 1, productoId: 2, nombreProducto: 'Ibuprofeno 400 mg', numeroLote: 'L-2025-IBU2', fechaVencimiento: '2027-05-20', cantidadRecibida: 50, costoUnitarioReal: 0.40 }
    ],
    items: [
      { id: 1, productoId: 2, nombreProducto: 'Ibuprofeno 400 mg', numeroLote: 'L-2025-IBU2', fechaVencimiento: '2027-05-20', cantidadRecibida: 50, costoUnitarioReal: 0.40 }
    ]
  }
];

// Kardex
let KARDEX = [
  { id: 1, productoId: 1, loteId: 1, numeroLote: 'L-2024-PAR', sucursalId: 1, tipoMovimiento: 'INGRESO_INICIAL', cantidad: 50, saldoResultante: 50, referenciaTipo: 'INICIAL', referenciaId: 'INI-001', motivo: 'Carga inicial de inventario', usuarioId: 1, fechaHora: '2026-10-23T08:00:00Z' },
  { id: 2, productoId: 2, loteId: 2, numeroLote: 'L-2024-IBU1', sucursalId: 1, tipoMovimiento: 'INGRESO_INICIAL', cantidad: 30, saldoResultante: 30, referenciaTipo: 'INICIAL', referenciaId: 'INI-001', motivo: 'Carga inicial de inventario', usuarioId: 1, fechaHora: '2026-10-23T08:00:00Z' },
  { id: 3, productoId: 3, loteId: 4, numeroLote: 'L-2024-AMX', sucursalId: 1, tipoMovimiento: 'INGRESO_INICIAL', cantidad: 50, saldoResultante: 50, referenciaTipo: 'INICIAL', referenciaId: 'INI-001', motivo: 'Carga inicial de inventario', usuarioId: 1, fechaHora: '2026-10-23T08:00:00Z' },
  { id: 4, productoId: 3, loteId: 4, numeroLote: 'L-2024-AMX', sucursalId: 1, tipoMovimiento: 'SALIDA_VENTA', cantidad: -11, saldoResultante: 8, referenciaTipo: 'VENTA', referenciaId: 'B001-00001024', motivo: 'Venta Boleta POS', usuarioId: 1, fechaHora: '2026-10-23T14:30:00Z' }
];

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With'
  });
  res.end(payload);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  try {
    // ==========================================
    // 1. AUTH (ms-auth)
    // ==========================================
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const user = USUARIOS[body.username];

      if (user && user.password === body.password) {
        return sendJson(res, 200, {
          token: `mock-jwt-token-farmagest-${user.username}-${Date.now()}`,
          tipo: 'Bearer',
          expiracionMs: 86400000,
          usuario: {
            id: user.id,
            username: user.username,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email,
            rolPrincipal: user.rolPrincipal,
            sucursalId: user.sucursalId,
            roles: user.roles,
            permisos: user.permisos
          }
        });
      } else {
        return sendJson(res, 401, {
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          message: 'Usuario o contraseña incorrectos. Verifica tus credenciales.'
        });
      }
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = USUARIOS.admin;
      return sendJson(res, 200, {
        id: user.id,
        username: user.username,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        sucursalId: user.sucursalId,
        activo: user.activo,
        creadoEn: user.creadoEn,
        roles: user.roles,
        permisos: user.permisos
      });
    }

    if (pathname === '/api/auth/usuarios' && req.method === 'GET') {
      const lista = Object.values(USUARIOS).map(u => ({
        id: u.id,
        username: u.username,
        nombres: u.nombres,
        apellidos: u.apellidos,
        email: u.email,
        sucursalId: u.sucursalId,
        activo: u.activo,
        creadoEn: u.creadoEn,
        roles: u.roles,
        permisos: u.permisos
      }));
      return sendJson(res, 200, { content: lista });
    }

    if (pathname === '/api/auth/usuarios' && req.method === 'POST') {
      const body = await parseBody(req);
      const roleMap = { 1: 'ROLE_ADMINISTRADOR', 2: 'ROLE_VENDEDOR', 3: 'ROLE_ALMACENERO' };
      const rolPrincipal = roleMap[body.rolIds?.[0]] || 'ROLE_VENDEDOR';
      const permisos = rolPrincipal === 'ROLE_ADMINISTRADOR' ? PERMISOS_ADMIN : (rolPrincipal === 'ROLE_ALMACENERO' ? PERMISOS_ALMACENERO : PERMISOS_VENDEDOR);

      const nuevo = {
        id: Object.keys(USUARIOS).length + 1,
        username: body.username,
        password: body.password,
        nombres: body.nombres,
        apellidos: body.apellidos,
        email: body.email,
        rolPrincipal: rolPrincipal,
        sucursalId: body.sucursalId || 1,
        roles: [rolPrincipal],
        permisos: permisos,
        activo: true,
        creadoEn: new Date().toISOString()
      };
      USUARIOS[body.username] = nuevo;
      return sendJson(res, 201, nuevo);
    }

    if (pathname.match(/^\/api\/auth\/usuarios\/\d+\/estado$/) && req.method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const body = await parseBody(req);
      const user = Object.values(USUARIOS).find(u => u.id === id);
      if (user) user.activo = body.activo;
      return sendJson(res, 200, {});
    }

    if (pathname.match(/^\/api\/auth\/usuarios\/\d+$/) && req.method === 'DELETE') {
      const id = parseInt(pathname.split('/')[4]);
      const username = Object.keys(USUARIOS).find(k => USUARIOS[k].id === id);
      if (username && username !== 'admin') {
        delete USUARIOS[username];
        return sendJson(res, 204, {});
      }
      return sendJson(res, 400, { message: 'No se puede eliminar el usuario principal o no encontrado' });
    }

    // ==========================================
    // 2. REPORTES & DASHBOARD (ms-reportes)
    // ==========================================
    if (pathname === '/api/reportes/dashboard' && req.method === 'GET') {
      return sendJson(res, 200, {
        periodo: query.periodo || 'mes',
        kpis: {
          ventasHoy: { monto: 1450.00, variacionPorcentual: 12.5 },
          ventasMes: { monto: 38920.00, variacionPorcentual: 8.3 },
          ventasAnio: { monto: 342150.00, variacionPorcentual: 15.2 },
          utilidadMes: { monto: 14250.00, margenPorcentual: 36.6 },
          ticketPromedio: { monto: 28.50, totalTransaccionesDia: 42 }
        },
        productosMasVendidos: [
          { rank: 1, productoId: 1, producto: 'Paracetamol 500 mg', unidades: 450, monto: 225.00 },
          { rank: 2, productoId: 2, producto: 'Ibuprofeno 400 mg', unidades: 320, monto: 288.00 },
          { rank: 3, productoId: 7, producto: 'Alcohol 70° 250 ml', unidades: 180, monto: 1080.00 },
          { rank: 4, productoId: 3, producto: 'Amoxicilina 500 mg', unidades: 140, monto: 350.00 },
          { rank: 5, productoId: 6, producto: 'Vitamina C 1 g', unidades: 110, monto: 220.00 }
        ],
        ventasPorMedioPago: [
          { medioPago: 'EFECTIVO', porcentaje: 52, total: 20238.40 },
          { medioPago: 'TARJETA', porcentaje: 31, total: 12065.20 },
          { medioPago: 'YAPE_PLIN', porcentaje: 17, total: 6616.40 }
        ],
        ventasPorVendedor: [
          { usuarioId: 2, vendedor: 'Carlos Gómez Soto', monto: 21450.00, totalVentas: 750 },
          { usuarioId: 3, vendedor: 'Lucía Morales Rivas', monto: 17470.00, totalVentas: 612 }
        ]
      });
    }

    if (pathname === '/api/reportes/ventas/por-dia-semana' && req.method === 'GET') {
      return sendJson(res, 200, [
        { dia: 'Lunes', montoPromedio: 1250.00, esMayor: false },
        { dia: 'Martes', montoPromedio: 1180.00, esMayor: false },
        { dia: 'Miércoles', montoPromedio: 1420.00, esMayor: false },
        { dia: 'Jueves', montoPromedio: 1390.00, esMayor: false },
        { dia: 'Viernes', montoPromedio: 1890.00, esMayor: true },
        { dia: 'Sábado', montoPromedio: 2150.00, esMayor: true },
        { dia: 'Domingo', montoPromedio: 980.00, esMayor: false }
      ]);
    }

    if (pathname === '/api/reportes/auditoria' && req.method === 'GET') {
      return sendJson(res, 200, {
        content: [
          { id: 1, evento: 'VENTA_REGISTRADA', servicio: 'ms-ventas', payloadResumen: 'Boleta B001-00001024 emitida por S/ 32.50', usuarioId: 1, usuarioUsername: 'admin', sucursalId: 1, fechaHora: '2026-10-23T14:30:00Z' },
          { id: 2, evento: 'STOCK_DESCONTADO_FEFO', servicio: 'ms-inventario', payloadResumen: 'Descuento de lote L-2024-PAR (-10 un.) y L-2024-AMX (-11 un.)', usuarioId: 1, usuarioUsername: 'admin', sucursalId: 1, fechaHora: '2026-10-23T14:30:05Z' },
          { id: 3, evento: 'CAJA_APERTURADA', servicio: 'ms-ventas', payloadResumen: 'Apertura de turno Caja Principal POS 01 con S/ 200.00', usuarioId: 1, usuarioUsername: 'admin', sucursalId: 1, fechaHora: '2026-10-23T08:00:00Z' },
          { id: 4, evento: 'ORDEN_COMPRA_APROBADA', servicio: 'ms-compras', payloadResumen: 'Orden OC-2026-0001 aprobada por S/ 118.00', usuarioId: 1, usuarioUsername: 'admin', sucursalId: 1, fechaHora: '2026-10-20T10:00:00Z' }
        ],
        totalElements: 4,
        totalPages: 1,
        size: 20,
        number: 0
      });
    }

    // ==========================================
    // 3. CATALOGO (ms-catalogo)
    // ==========================================
    if (pathname === '/api/catalogo/productos' && req.method === 'GET') {
      return sendJson(res, 200, {
        content: PRODUCTOS,
        totalElements: PRODUCTOS.length,
        totalPages: 1,
        size: 50,
        number: 0,
        first: true,
        last: true,
        empty: false
      });
    }

    if (pathname.match(/^\/api\/catalogo\/productos\/\d+$/) && req.method === 'GET') {
      const id = parseInt(pathname.split('/')[4]);
      const prod = PRODUCTOS.find(p => p.id === id);
      if (prod) return sendJson(res, 200, prod);
      return sendJson(res, 404, { message: 'Producto no encontrado' });
    }

    if (pathname.startsWith('/api/catalogo/productos/codigo/') && req.method === 'GET') {
      const codigo = pathname.split('/').pop();
      const prod = PRODUCTOS.find(p => p.codigoBarras === codigo);
      if (prod) return sendJson(res, 200, prod);
      return sendJson(res, 404, { message: 'Producto no encontrado' });
    }

    if (pathname === '/api/catalogo/productos/carga-masiva' && req.method === 'POST') {
      const body = await parseBody(req);
      const lista = Array.isArray(body) ? body : (body.productos || (body.nombre ? [body] : []));
      const importados = [];

      lista.forEach((p, idx) => {
        const cat = CATEGORIAS.find(c => c.nombre.toLowerCase() === (p.categoria || '').toLowerCase()) || CATEGORIAS[0];
        const lab = LABORATORIOS.find(l => l.nombre.toLowerCase() === (p.laboratorio || '').toLowerCase()) || LABORATORIOS[0];

        const precioVenta = parseFloat(p.precioVenta) || 1.00;
        const precioCosto = parseFloat(p.precioCosto) || (precioVenta * 0.6);
        const stockInicial = parseInt(p.stockInicial) || 20;

        const nuevoProd = {
          id: PRODUCTOS.length + 1,
          codigoBarras: String(p.codigoBarras || ('775' + Date.now().toString().slice(-7) + idx)),
          nombre: p.nombre || ('Medicamento ' + (PRODUCTOS.length + 1)),
          principioActivo: p.principioActivo || p.nombre || 'Genérico',
          concentracion: p.concentracion || '500 mg',
          presentacion: p.presentacion || 'Tableta',
          categoria: cat,
          laboratorio: lab,
          precioVenta: precioVenta,
          precioCosto: precioCosto,
          margenPorcentaje: Number(((precioVenta - precioCosto) / precioVenta * 100).toFixed(1)),
          requiereReceta: p.requiereReceta === true || String(p.requiereReceta).toLowerCase() === 'true',
          activo: true,
          creadoEn: new Date().toISOString()
        };
        PRODUCTOS.push(nuevoProd);

        // Crear registro en STOCK
        const nuevoStock = {
          id: STOCK.length + 1,
          productoId: nuevoProd.id,
          sucursalId: 1,
          stockActual: stockInicial,
          stockMinimo: 10,
          stockMaximo: 200,
          estadoStock: stockInicial <= 10 ? 'BAJO' : 'OPTIMO',
          actualizadoEn: new Date().toISOString(),
          nombreProducto: nuevoProd.nombre,
          codigoBarras: nuevoProd.codigoBarras,
          presentacion: nuevoProd.presentacion
        };
        STOCK.push(nuevoStock);

        // Crear lote inicial FEFO
        const numLote = p.numeroLote || ('L-' + new Date().getFullYear() + '-' + String(idx + 1).padStart(3, '0'));
        const fechaVenc = p.fechaVencimiento || '2028-12-31';
        const dias = Math.max(1, Math.round((new Date(fechaVenc) - new Date()) / (1000 * 60 * 60 * 24)));
        const semaforo = dias <= 30 ? 'ROJO' : (dias <= 90 ? 'AMARILLO' : 'VERDE');

        const nuevoLote = {
          id: LOTES.length + 1,
          productoId: nuevoProd.id,
          sucursalId: 1,
          numeroLote: numLote,
          fechaVencimiento: fechaVenc,
          cantidadInicial: stockInicial,
          cantidadActual: stockInicial,
          costoUnitario: precioCosto,
          estado: 'DISPONIBLE',
          diasRestantes: dias,
          semaforoVencimiento: semaforo
        };
        LOTES.push(nuevoLote);

        // Registrar en Kardex
        KARDEX.unshift({
          id: KARDEX.length + 1,
          productoId: nuevoProd.id,
          loteId: nuevoLote.id,
          numeroLote: numLote,
          sucursalId: 1,
          tipoMovimiento: 'INGRESO_INICIAL',
          cantidad: stockInicial,
          saldoResultante: stockInicial,
          referenciaTipo: 'CARGA_MASIVA',
          referenciaId: 'IMP-' + Date.now().toString().slice(-4),
          motivo: 'Carga masiva inicial de inventario',
          usuarioId: 1,
          fechaHora: new Date().toISOString()
        });

        importados.push(nuevoProd);
      });

      return sendJson(res, 201, {
        mensaje: `Se importaron exitosamente ${importados.length} productos con su inventario inicial.`,
        totalImportados: importados.length,
        productos: importados
      });
    }

    if (pathname === '/api/catalogo/productos' && req.method === 'POST') {
      const body = await parseBody(req);
      const cat = CATEGORIAS.find(c => c.id === body.categoriaId) || CATEGORIAS[0];
      const lab = LABORATORIOS.find(l => l.id === body.laboratorioId) || LABORATORIOS[0];
      const nuevo = {
        id: PRODUCTOS.length + 1,
        codigoBarras: body.codigoBarras,
        nombre: body.nombre,
        principioActivo: body.principioActivo,
        concentracion: body.concentracion,
        presentacion: body.presentacion,
        categoria: cat,
        laboratorio: lab,
        precioVenta: body.precioVenta,
        precioCosto: body.precioCosto,
        margenPorcentaje: ((body.precioVenta - body.precioCosto) / body.precioVenta * 100).toFixed(1),
        requiereReceta: !!body.requiereReceta,
        activo: true,
        creadoEn: new Date().toISOString()
      };
      PRODUCTOS.push(nuevo);
      return sendJson(res, 201, nuevo);
    }

    if (pathname.match(/^\/api\/catalogo\/productos\/\d+\/precio$/) && req.method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const body = await parseBody(req);
      const prod = PRODUCTOS.find(p => p.id === id);
      if (prod) {
        HISTORIAL_PRECIOS.unshift({
          id: HISTORIAL_PRECIOS.length + 1,
          productoId: prod.id,
          nombreProducto: prod.nombre,
          precioAnterior: prod.precioVenta,
          precioNuevo: body.nuevoPrecioVenta,
          costoAnterior: prod.precioCosto,
          costoNuevo: body.nuevoPrecioCosto || prod.precioCosto,
          motivo: body.motivo || 'Actualización manual de precio',
          usuarioId: 1,
          fechaCambio: new Date().toISOString()
        });
        prod.precioVenta = body.nuevoPrecioVenta;
        if (body.nuevoPrecioCosto) prod.precioCosto = body.nuevoPrecioCosto;
        return sendJson(res, 200, prod);
      }
      return sendJson(res, 404, { message: 'Producto no encontrado' });
    }

    if (pathname.match(/^\/api\/catalogo\/productos\/\d+\/historial-precios$/) && req.method === 'GET') {
      const id = parseInt(pathname.split('/')[4]);
      const hist = HISTORIAL_PRECIOS.filter(h => h.productoId === id);
      return sendJson(res, 200, hist);
    }

        if (pathname.match(/^\/api\/catalogo\/productos\/\d+\/estado$/) && req.method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const prod = PRODUCTOS.find(p => p.id === id);
      if (prod) {
        prod.activo = query.activo === 'true';
        return sendJson(res, 200, prod);
      }
      return sendJson(res, 404, { message: 'Producto no encontrado' });
    }

    if (pathname.match(/^\/api\/catalogo\/productos\/\d+$/) && req.method === 'DELETE') {
      const id = parseInt(pathname.split('/')[4]);
      const idx = PRODUCTOS.findIndex(p => p.id === id);
      if (idx >= 0) {
        PRODUCTOS[idx].activo = false;
        return sendJson(res, 204, {});
      }
      return sendJson(res, 404, { message: 'Producto no encontrado' });
    }

    if (pathname === '/api/catalogo/categorias' && req.method === 'GET') {
      return sendJson(res, 200, CATEGORIAS);
    }

    if (pathname === '/api/catalogo/laboratorios' && req.method === 'GET') {
      return sendJson(res, 200, LABORATORIOS);
    }

    // ==========================================
    // 4. INVENTARIO (ms-inventario)
    // ==========================================
    if (pathname === '/api/inventario/stock' && req.method === 'GET') {
      return sendJson(res, 200, STOCK);
    }

    if (pathname.match(/^\/api\/inventario\/stock\/producto\/\d+$/) && req.method === 'GET') {
      const prodId = parseInt(pathname.split('/')[5]);
      const st = STOCK.find(s => s.productoId === prodId) || { productoId: prodId, stockActual: 0, stockMinimo: 10, estadoStock: 'CRITICO' };
      return sendJson(res, 200, st);
    }

    if (pathname === '/api/inventario/stock-bajo' && req.method === 'GET') {
      const bajos = STOCK.filter(s => s.stockActual <= s.stockMinimo);
      return sendJson(res, 200, bajos);
    }

    if (pathname === '/api/inventario/alertas' && req.method === 'GET') {
      return sendJson(res, 200, ALERTAS);
    }

    if (pathname.match(/^\/api\/inventario\/alertas\/\d+\/atender$/) && req.method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const alerta = ALERTAS.find(a => a.id === id);
      if (alerta) alerta.atendida = true;
      return sendJson(res, 200, {});
    }

    if (pathname.startsWith('/api/inventario/lotes/producto/') && req.method === 'GET') {
      const prodId = parseInt(pathname.split('/').pop());
      const lotesProd = LOTES.filter(l => l.productoId === prodId);
      return sendJson(res, 200, lotesProd);
    }

    if (pathname === '/api/inventario/lotes/por-vencer' && req.method === 'GET') {
      const dias = parseInt(query.dias) || 90;
      const porVencer = LOTES.filter(l => l.diasRestantes <= dias);
      return sendJson(res, 200, porVencer);
    }

    if (pathname.startsWith('/api/inventario/kardex/producto/') && req.method === 'GET') {
      const prodId = parseInt(pathname.split('/').pop());
      const kardexProd = KARDEX.filter(k => k.productoId === prodId);
      return sendJson(res, 200, kardexProd);
    }

    if (pathname === '/api/inventario/ajustes' && req.method === 'POST') {
      const body = await parseBody(req);
      const st = STOCK.find(s => s.productoId === body.productoId);
      const isSalida = body.tipoAjuste === 'AJUSTE_MERMA' || body.tipoAjuste === 'AJUSTE_VENCIMIENTO' || body.tipoAjuste === 'MERMA' || body.tipoAjuste === 'ROTURA';
      const delta = isSalida ? -Math.abs(body.cantidad) : Math.abs(body.cantidad);
      const saldo = Math.max(0, (st ? st.stockActual : 0) + delta);
      if (st) st.stockActual = saldo;

      if (body.loteId) {
        const lote = LOTES.find(l => l.id === body.loteId);
        if (lote) {
          lote.cantidadActual = Math.max(0, lote.cantidadActual + delta);
        }
      }

      const nuevoKardex = {
        id: KARDEX.length + 1,
        productoId: body.productoId,
        loteId: body.loteId,
        numeroLote: body.numeroLote || (LOTES.find(l => l.id === body.loteId)?.numeroLote) || 'AJUSTE',
        sucursalId: 1,
        tipoMovimiento: body.tipoAjuste || (delta < 0 ? 'AJUSTE_MERMA' : 'AJUSTE_SOBRANTE'),
        cantidad: delta,
        saldoResultante: saldo,
        motivo: body.motivo || 'Ajuste manual de inventario',
        usuarioId: 1,
        fechaHora: new Date().toISOString()
      };
      KARDEX.unshift(nuevoKardex);
      return sendJson(res, 201, nuevoKardex);
    }

    // ==========================================
    // 5. CAJA Y VENTAS (ms-ventas)
    // ==========================================
    if (pathname === '/api/caja/cajas' && req.method === 'GET') {
      return sendJson(res, 200, CAJAS);
    }

    if (pathname === '/api/caja/mi-turno' && req.method === 'GET') {
      return sendJson(res, 200, SESION_CAJA_ACTUAL);
    }

    if (pathname === '/api/caja/sesiones' && req.method === 'GET') {
      return sendJson(res, 200, [SESION_CAJA_ACTUAL]);
    }

    if (pathname === '/api/caja/apertura' && req.method === 'POST') {
      const body = await parseBody(req);
      SESION_CAJA_ACTUAL = {
        id: (SESION_CAJA_ACTUAL?.id || 0) + 1,
        cajaId: body.cajaId || 1,
        nombreCaja: body.cajaId === 2 ? 'Caja Rápida POS 02' : 'Caja Principal POS 01',
        codigoCaja: body.cajaId === 2 ? 'CAJA-02' : 'CAJA-01',
        usuarioId: 1,
        sucursalId: 1,
        montoApertura: body.montoApertura || 100.00,
        estado: 'ABIERTA',
        fechaApertura: new Date().toISOString(),
        observaciones: body.observaciones || '',
        totalVentasEfectivo: 0,
        totalVentasTarjeta: 0,
        totalVentasBilletera: 0,
        totalVentasGeneral: 0,
        cantidadTransacciones: 0
      };
      return sendJson(res, 200, SESION_CAJA_ACTUAL);
    }

    if (pathname.match(/^\/api\/caja\/\d+\/cierre$/) && req.method === 'POST') {
      const body = await parseBody(req);
      if (SESION_CAJA_ACTUAL) {
        SESION_CAJA_ACTUAL.estado = 'CERRADA';
        SESION_CAJA_ACTUAL.montoCierreReal = body.montoCierreReal;
        SESION_CAJA_ACTUAL.montoCierreSistema = SESION_CAJA_ACTUAL.montoApertura + (SESION_CAJA_ACTUAL.totalVentasEfectivo || 0);
        SESION_CAJA_ACTUAL.diferencia = body.montoCierreReal - SESION_CAJA_ACTUAL.montoCierreSistema;
        SESION_CAJA_ACTUAL.fechaCierre = new Date().toISOString();
        SESION_CAJA_ACTUAL.observaciones = body.observaciones || SESION_CAJA_ACTUAL.observaciones;
      }
      return sendJson(res, 200, SESION_CAJA_ACTUAL);
    }

    if (pathname === '/api/ventas/clientes/cuentas-corrientes' && req.method === 'GET') {
      const conCredito = CLIENTES.filter(c => (c.limiteCredito && c.limiteCredito > 0) || (c.saldoDeudor && c.saldoDeudor > 0));
      return sendJson(res, 200, conCredito);
    }

    if (pathname.match(/^\/api\/ventas\/clientes\/\d+\/amortizar$/) && req.method === 'POST') {
      const id = parseInt(pathname.split('/')[4]);
      const body = await parseBody(req);
      const cli = CLIENTES.find(c => c.id === id);
      if (cli) {
        const monto = parseFloat(body.monto) || 0;
        cli.saldoDeudor = Math.max(0, Number(((cli.saldoDeudor || 0) - monto).toFixed(2)));
        return sendJson(res, 200, cli);
      }
      return sendJson(res, 404, { message: 'Cliente no encontrado' });
    }

    if (pathname === '/api/ventas/clientes' && req.method === 'GET') {
      return sendJson(res, 200, CLIENTES);
    }

    if (pathname.startsWith('/api/ventas/clientes/documento/') && req.method === 'GET') {
      const doc = pathname.split('/').pop();
      const cli = CLIENTES.find(c => c.numeroDocumento === doc);
      if (cli) return sendJson(res, 200, cli);
      return sendJson(res, 404, { message: 'Cliente no encontrado' });
    }

    if (pathname === '/api/ventas/clientes' && req.method === 'POST') {
      const body = await parseBody(req);
      const nuevo = {
        id: CLIENTES.length + 1,
        tipoDocumento: body.tipoDocumento || 'DNI',
        numeroDocumento: body.numeroDocumento,
        nombresORazonSocial: body.nombresORazonSocial,
        direccion: body.direccion || '',
        telefono: body.telefono || '',
        email: body.email || '',
        activo: true
      };
      CLIENTES.push(nuevo);
      return sendJson(res, 201, nuevo);
    }

    if (pathname === '/api/ventas/promociones' && req.method === 'GET') {
      return sendJson(res, 200, PROMOCIONES);
    }

    if (pathname === '/api/ventas/promociones' && req.method === 'POST') {
      const body = await parseBody(req);
      const nueva = {
        id: PROMOCIONES.length + 1,
        nombre: body.nombre,
        tipoAlcance: body.tipoAlcance,
        tipoDescuento: body.tipoDescuento,
        valorDescuento: body.valorDescuento,
        cantidadCondicion: body.cantidadCondicion,
        cantidadPagada: body.cantidadPagada,
        fechaInicio: body.fechaInicio,
        fechaFin: body.fechaFin,
        aplicaPorVencimiento: false,
        activo: true
      };
      PROMOCIONES.push(nueva);
      return sendJson(res, 201, nueva);
    }

    if (pathname.match(/^\/api\/ventas\/promociones\/\d+\/estado$/) && req.method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const promo = PROMOCIONES.find(p => p.id === id);
      if (promo) promo.activo = query.activo === 'true';
      return sendJson(res, 200, {});
    }

    if (pathname === '/api/ventas/cupones/validar' && req.method === 'POST') {
      const body = await parseBody(req);
      const cupon = CUPONES.find(c => c.codigo.toUpperCase() === (body.codigo || '').toUpperCase());
      if (cupon && cupon.activo) {
        return sendJson(res, 200, {
          valido: true,
          codigo: cupon.codigo,
          porcentajeDescuento: cupon.porcentajeDescuento,
          montoFijoDescuento: cupon.montoFijoDescuento,
          mensaje: `¡Cupón válido! Se aplicará un ${cupon.porcentajeDescuento}% de descuento`
        });
      } else {
        return sendJson(res, 200, {
          valido: false,
          codigo: body.codigo,
          mensaje: 'El cupón no existe o ya ha expirado'
        });
      }
    }

    if (pathname === '/api/ventas/espera' && req.method === 'GET') {
      return sendJson(res, 200, VENTAS_ESPERA);
    }

    if (pathname === '/api/ventas/espera' && req.method === 'POST') {
      const body = await parseBody(req);
      const ref = body.nombreReferencia || body.referencia || 'Cliente en mostrador';
      const dJson = body.datosJson || body.datosVentaJson || '{}';
      const nuevaEspera = {
        id: VENTAS_ESPERA.length + 1,
        usuarioId: 1,
        sucursalId: 1,
        codigoEspera: `ESP-${Date.now().toString().slice(-4)}`,
        nombreReferencia: ref,
        referencia: ref,
        datosJson: dJson,
        datosVentaJson: dJson,
        subtotal: body.subtotal || 0,
        igv: body.igv || 0,
        total: body.total || 0,
        descuentoTotal: body.descuentoTotal || 0,
        fechaHora: new Date().toISOString(),
        creadoEn: new Date().toISOString()
      };
      VENTAS_ESPERA.unshift(nuevaEspera);
      return sendJson(res, 201, nuevaEspera);
    }

    if (pathname.match(/^\/api\/ventas\/espera\/\d+$/) && req.method === 'DELETE') {
      const id = parseInt(pathname.split('/')[4]);
      VENTAS_ESPERA = VENTAS_ESPERA.filter(v => v.id !== id);
      return sendJson(res, 204, {});
    }

    // ==========================================
    // NOTAS DE CRÉDITO Y DEVOLUCIONES (SUNAT Tipo 07)
    // ==========================================
    if (pathname === '/api/ventas/notas-credito' && req.method === 'GET') {
      return sendJson(res, 200, NOTAS_CREDITO);
    }

    if (pathname.match(/^\/api\/ventas\/notas-credito\/\d+$/) && req.method === 'GET') {
      const id = parseInt(pathname.split('/')[4]);
      const nc = NOTAS_CREDITO.find(item => item.id === id);
      if (nc) return sendJson(res, 200, nc);
      return sendJson(res, 404, { message: 'Nota de crédito no encontrada' });
    }

    if (pathname === '/api/ventas/buscar-comprobante' && req.method === 'GET') {
      let q = (query.q || '').trim().toLowerCase();
      // Limpiar prefijos comunes como 'ej:', 'boleta:', 'factura:', 'b: ', 'f: '
      q = q.replace(/^ej:?\s*/i, '').replace(/^boleta:?\s*/i, '').replace(/^factura:?\s*/i, '').trim();
      const serie = (query.serie || '').trim().toLowerCase();
      const numero = (query.numero || '').trim().toLowerCase();

      let encontrada = null;
      if (serie && numero) {
        encontrada = VENTAS.find(v => 
          v.serieComprobante.toLowerCase() === serie && 
          (v.numeroComprobante.toLowerCase() === numero || parseInt(v.numeroComprobante, 10) === parseInt(numero, 10))
        );
      } else if (q) {
        const qClean = q.replace(/[-\s]/g, '');
        
        // Detectar si el usuario escribió Serie + Número (ej: "B001-1024", "B001 1024", "B1-1024")
        let qSerie = '';
        let qNum = '';
        const matchComp = q.match(/^([a-z0-9]{1,4})[-\s]+(\d+)$/i);
        if (matchComp) {
          qSerie = matchComp[1].toLowerCase();
          qNum = matchComp[2];
        }

        const isPureDigits = /^\d+$/.test(q);
        const qInt = isPureDigits ? parseInt(q, 10) : null;

        encontrada = VENTAS.find(v => {
          const comp = `${v.serieComprobante}-${v.numeroComprobante}`.toLowerCase();
          const compClean = `${v.serieComprobante}${v.numeroComprobante}`.toLowerCase();
          const numClean = (v.numeroComprobante || '').toLowerCase();
          const numInt = parseInt(v.numeroComprobante, 10);
          const serieComp = (v.serieComprobante || '').toLowerCase();

          // 1. Coincidencia exacta o parcial de cadena
          if (comp.includes(q) || compClean.includes(qClean) || numClean.includes(q)) return true;

          // 2. Coincidencia de Serie + Número sin ceros (ej: B001-1024 vs B001-00001024)
          if (qSerie && qNum) {
            if (serieComp === qSerie && (numInt === parseInt(qNum, 10) || numClean.endsWith(qNum))) return true;
          }

          // 3. Coincidencia solo por número correlativo (ej: "1024" vs "00001024")
          if (qInt !== null && !isNaN(qInt)) {
            if (numInt === qInt || numClean.endsWith(q)) return true;
          }

          // 4. Coincidencia por DNI / RUC o nombre del cliente
          if (v.cliente && v.cliente.numeroDocumento && v.cliente.numeroDocumento.includes(q)) return true;
          if (v.cliente && v.cliente.nombresORazonSocial && v.cliente.nombresORazonSocial.toLowerCase().includes(q)) return true;

          return false;
        });
      }

      if (encontrada) return sendJson(res, 200, encontrada);
      return sendJson(res, 404, { message: 'Comprobante no encontrado' });
    }

    if ((pathname === '/api/ventas/notas-credito' || pathname.match(/^\/api\/ventas\/\d+\/nota-credito$/)) && req.method === 'POST') {
      const body = await parseBody(req);
      const ventaId = body.ventaId || (pathname.includes('/nota-credito') ? parseInt(pathname.split('/')[3]) : null);
      const v = VENTAS.find(vt => vt.id === ventaId);
      
      if (!v) {
        return sendJson(res, 404, { message: 'Venta original no encontrada para emitir la Nota de Crédito' });
      }

      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return sendJson(res, 400, { message: 'Debe especificar al menos un ítem a devolver' });
      }

      if (!body.motivoSustento || !body.motivoSustento.trim()) {
        return sendJson(res, 400, { message: 'El motivo y sustento de la Nota de Crédito es obligatorio según normativa SUNAT' });
      }

      // Catálogo 09 SUNAT
      const mapaDescripcionesNC = {
        '01': 'Anulación de la operación',
        '02': 'Anulación por error en el RUC',
        '03': 'Corrección por error en la descripción',
        '04': 'Descuento global',
        '05': 'Descuento por ítem',
        '06': 'Devolución total',
        '07': 'Devolución por ítem'
      };

      const codigoTipoNC = body.tipoNotaCredito || '07';
      const descTipoNC = mapaDescripcionesNC[codigoTipoNC] || 'Devolución por ítem';

      // Calcular montos de devolución
      let totalDevuelto = 0;
      const detallesNC = [];

      for (const it of body.items) {
        const cantDev = Number(it.cantidadDevuelta) || 0;
        if (cantDev <= 0) continue;

        const precio = Number(it.precioUnitario) || 0;
        const subLinea = Number((cantDev * precio).toFixed(2));
        totalDevuelto += subLinea;

        detallesNC.push({
          id: detallesNC.length + 1,
          detalleVentaId: it.detalleVentaId || null,
          productoId: it.productoId,
          nombreProducto: it.nombreProducto || 'Medicamento',
          loteId: it.loteId || null,
          numeroLote: it.numeroLote || 'LOTE-DEV',
          cantidadDevuelta: cantDev,
          precioUnitario: precio,
          subtotal: subLinea,
          reingresaAStock: it.reingresaAStock !== false,
          motivoItem: it.motivoItem || body.motivoSustento
        });

        // 1. Reingreso a Inventario y Kardex si aplica
        if (it.reingresaAStock !== false) {
          const st = STOCK.find(s => s.productoId === it.productoId);
          if (st) st.stockActual += cantDev;

          if (it.loteId) {
            const lote = LOTES.find(l => l.id === it.loteId);
            if (lote) lote.cantidadActual += cantDev;
          }

          KARDEX.unshift({
            id: KARDEX.length + 1,
            productoId: it.productoId,
            loteId: it.loteId || null,
            numeroLote: it.numeroLote || 'LOTE-DEV',
            sucursalId: 1,
            tipoMovimiento: 'ENTRADA_DEVOLUCION_VENTA',
            cantidad: cantDev,
            saldoResultante: st ? st.stockActual : cantDev,
            referenciaTipo: 'NOTA_CREDITO',
            referenciaId: `${v.tipoComprobante === 'FACTURA' ? 'FC01' : 'BC01'}-${String(NOTAS_CREDITO.length + 1).padStart(8, '0')}`,
            motivo: `Reingreso por Nota de Crédito: ${body.motivoSustento}`,
            usuarioId: 1,
            fechaHora: new Date().toISOString()
          });
        }
      }

      totalDevuelto = Number(totalDevuelto.toFixed(2));
      const subtotalDevuelto = Number((totalDevuelto / 1.18).toFixed(2));
      const igvDevuelto = Number((totalDevuelto - subtotalDevuelto).toFixed(2));

      // Serie y Correlativo oficial SUNAT (FC01 para Factura, BC01 para Boleta)
      const serieNC = v.tipoComprobante === 'FACTURA' ? 'FC01' : (v.tipoComprobante === 'NOTA_VENTA' ? 'NC01' : 'BC01');
      const correlativoNC = String(NOTAS_CREDITO.length + 1).padStart(8, '0');
      const ahora = new Date().toISOString();

      // Reembolso financiero / Cuenta Corriente
      const medioReembolso = body.medioReembolso || v.medioPago || 'EFECTIVO';
      if ((v.medioPago === 'CREDITO' || medioReembolso === 'CREDITO') && v.cliente && v.cliente.id) {
        const cli = CLIENTES.find(c => c.id === v.cliente.id);
        if (cli) {
          cli.saldoDeudor = Math.max(0, Number(((cli.saldoDeudor || 0) - totalDevuelto).toFixed(2)));
        }
      } else if (medioReembolso === 'EFECTIVO') {
        if (SESION_CAJA_ACTUAL && SESION_CAJA_ACTUAL.estado === 'ABIERTA') {
          SESION_CAJA_ACTUAL.totalVentasEfectivo = Math.max(0, Number(((SESION_CAJA_ACTUAL.totalVentasEfectivo || 0) - totalDevuelto).toFixed(2)));
          SESION_CAJA_ACTUAL.totalVentasGeneral = Math.max(0, Number(((SESION_CAJA_ACTUAL.totalVentasGeneral || 0) - totalDevuelto).toFixed(2)));
        }
      }

      // Actualizar estado de la venta
      const totalCantVendida = (v.detalles || v.items || []).reduce((acc, d) => acc + (d.cantidad || 0), 0);
      const totalCantDevuelta = detallesNC.reduce((acc, d) => acc + d.cantidadDevuelta, 0);

      if (totalCantDevuelta >= totalCantVendida || codigoTipoNC === '01' || codigoTipoNC === '06') {
        v.estado = 'ANULADA';
      } else {
        v.estado = 'CON_NOTA_CREDITO';
      }
      v.notaCreditoReferencia = `${serieNC}-${correlativoNC}`;

      // Generar Hash CPE y QR oficial de Nota de Crédito
      const hashSimulado = Buffer.from(`${serieNC}-${correlativoNC}-${totalDevuelto}-${ahora}`).toString('base64').substring(0, 28);
      const qrUrl = `https://sunat.gob.pe/cpe?ruc=20601234567&tipo=07&serie=${serieNC}&numero=${correlativoNC}&monto=${totalDevuelto}&fecha=${ahora.substring(0, 10)}`;

      const nuevaNotaCredito = {
        id: NOTAS_CREDITO.length + 1,
        sucursalId: v.sucursalId || 1,
        sesionCajaId: v.sesionCajaId || (SESION_CAJA_ACTUAL ? SESION_CAJA_ACTUAL.id : 1),
        ventaId: v.id,
        tipoComprobanteModificado: v.tipoComprobante,
        serieComprobanteModificado: v.serieComprobante,
        numeroComprobanteModificado: v.numeroComprobante,
        serieNotaCredito: serieNC,
        numeroNotaCredito: correlativoNC,
        tipoNotaCredito: codigoTipoNC,
        descripcionTipoNotaCredito: descTipoNC,
        motivoSustento: body.motivoSustento.trim(),
        cliente: v.cliente,
        fechaHora: ahora,
        subtotalDevuelto: subtotalDevuelto,
        igvDevuelto: igvDevuelto,
        totalDevuelto: totalDevuelto,
        medioReembolso: medioReembolso,
        reingresoStockRealizado: detallesNC.some(d => d.reingresaAStock),
        hashCpe: hashSimulado,
        qrCodeUrl: qrUrl,
        estadoSunat: 'ACEPTADA',
        detalles: detallesNC
      };

      NOTAS_CREDITO.unshift(nuevaNotaCredito);
      return sendJson(res, 201, nuevaNotaCredito);
    }

    if (pathname === '/api/ventas' && req.method === 'GET') {
      return sendJson(res, 200, VENTAS);
    }

    if (pathname.match(/^\/api\/ventas\/\d+$/) && req.method === 'GET') {
      const id = parseInt(pathname.split('/')[3]);
      const v = VENTAS.find(vt => vt.id === id);
      if (v) return sendJson(res, 200, v);
      return sendJson(res, 404, { message: 'Venta no encontrada' });
    }

    if (pathname.match(/^\/api\/ventas\/\d+\/anular$/) && req.method === 'POST') {
      const id = parseInt(pathname.split('/')[3]);
      const v = VENTAS.find(vt => vt.id === id);
      if (v) {
        v.estado = 'ANULADA';
        const listaDetalles = v.detalles || v.items || [];
        listaDetalles.forEach(it => {
          const st = STOCK.find(s => s.productoId === it.productoId);
          if (st) st.stockActual += it.cantidad;
          if (it.loteId) {
            const lote = LOTES.find(l => l.id === it.loteId);
            if (lote) lote.cantidadActual += it.cantidad;
          }
          KARDEX.unshift({
            id: KARDEX.length + 1,
            productoId: it.productoId,
            loteId: it.loteId,
            numeroLote: it.numeroLote || 'LOTE',
            sucursalId: 1,
            tipoMovimiento: 'DEVOLUCION_CLIENTE',
            cantidad: it.cantidad,
            saldoResultante: st ? st.stockActual : it.cantidad,
            referenciaTipo: 'ANULACION_VENTA',
            referenciaId: `${v.serieComprobante}-${v.numeroComprobante}`,
            motivo: 'Anulación de venta y comprobante',
            usuarioId: 1,
            fechaHora: new Date().toISOString()
          });
        });
        return sendJson(res, 200, v);
      }
      return sendJson(res, 404, { message: 'Venta no encontrada' });
    }

    if (pathname === '/api/ventas' && req.method === 'POST') {
      const body = await parseBody(req);
      const correlativo = String(VENTAS.length + 1025).padStart(8, '0');
      const serie = body.tipoComprobante === 'FACTURA' ? 'F001' : (body.tipoComprobante === 'NOTA_VENTA' ? 'NV01' : 'B001');

      // Buscar o mapear cliente
      let clienteVenta = null;
      if (body.clienteId) {
        clienteVenta = CLIENTES.find(c => c.id === body.clienteId);
      } else if (body.clienteNumeroDocumento) {
        clienteVenta = CLIENTES.find(c => c.numeroDocumento === body.clienteNumeroDocumento) || {
          id: CLIENTES.length + 1,
          tipoDocumento: body.clienteTipoDocumento || 'DNI',
          numeroDocumento: body.clienteNumeroDocumento,
          nombresORazonSocial: body.clienteNombre || 'CLIENTE',
          direccion: body.clienteDireccion || '',
          activo: true
        };
      } else if (body.cliente) {
        clienteVenta = body.cliente;
      } else {
        clienteVenta = CLIENTES[0];
      }

      // Detalle items
      const inputItems = body.items || body.detalles || [];
      const detallesVenta = inputItems.map((it, idx) => {
        const prod = PRODUCTOS.find(p => p.id === it.productoId);
        const subtotalLinea = Number(((it.cantidad * it.precioUnitario) - (it.descuento || it.descuentoLinea || 0)).toFixed(2));

        // Descontar inventario
        const st = STOCK.find(s => s.productoId === it.productoId);
        if (st) st.stockActual = Math.max(0, st.stockActual - it.cantidad);
        if (it.loteId) {
          const lote = LOTES.find(l => l.id === it.loteId);
          if (lote) lote.cantidadActual = Math.max(0, lote.cantidadActual - it.cantidad);
        }

        // Kardex
        KARDEX.unshift({
          id: KARDEX.length + 1,
          productoId: it.productoId,
          loteId: it.loteId,
          numeroLote: it.numeroLote || 'FEFO',
          sucursalId: 1,
          tipoMovimiento: 'SALIDA_VENTA',
          cantidad: -it.cantidad,
          saldoResultante: st ? st.stockActual : 0,
          referenciaTipo: 'VENTA',
          referenciaId: `${serie}-${correlativo}`,
          motivo: `Venta ${body.tipoComprobante || 'BOLETA'}`,
          usuarioId: 1,
          fechaHora: new Date().toISOString()
        });

        return {
          id: idx + 1,
          productoId: it.productoId,
          nombreProducto: prod ? prod.nombre : `Producto #${it.productoId}`,
          loteId: it.loteId,
          numeroLote: it.numeroLote || 'FEFO-LOTE',
          cantidad: it.cantidad,
          precioUnitario: it.precioUnitario,
          costoUnitario: it.costoUnitario || (prod ? prod.precioCosto : 0),
          descuentoLinea: it.descuento || it.descuentoLinea || 0,
          subtotalLinea: subtotalLinea
        };
      });

      const totalCalculado = detallesVenta.reduce((acc, d) => acc + d.subtotalLinea, 0);
      const totalFinal = body.total !== undefined ? body.total : totalCalculado;
      const subtotalBase = parseFloat((totalFinal / 1.18).toFixed(2));
      const igv = parseFloat((totalFinal - subtotalBase).toFixed(2));
      const montoDescuentoTotal = detallesVenta.reduce((acc, d) => acc + d.descuentoLinea, 0) + (body.descuentoManual || 0);

      const montoRecibido = body.montoRecibido || body.montoEfectivo || totalFinal;
      const vuelto = body.medioPago === 'EFECTIVO' ? Math.max(0, Number((montoRecibido - totalFinal).toFixed(2))) : 0;

      // Actualizar turno caja
      if (SESION_CAJA_ACTUAL && SESION_CAJA_ACTUAL.estado === 'ABIERTA') {
        SESION_CAJA_ACTUAL.cantidadTransacciones = (SESION_CAJA_ACTUAL.cantidadTransacciones || 0) + 1;
        SESION_CAJA_ACTUAL.totalVentasGeneral = (SESION_CAJA_ACTUAL.totalVentasGeneral || 0) + totalFinal;
        if (body.medioPago === 'EFECTIVO') SESION_CAJA_ACTUAL.totalVentasEfectivo = (SESION_CAJA_ACTUAL.totalVentasEfectivo || 0) + totalFinal;
        else if (body.medioPago === 'TARJETA') SESION_CAJA_ACTUAL.totalVentasTarjeta = (SESION_CAJA_ACTUAL.totalVentasTarjeta || 0) + totalFinal;
        else SESION_CAJA_ACTUAL.totalVentasBilletera = (SESION_CAJA_ACTUAL.totalVentasBilletera || 0) + totalFinal;
      }

      const ahora = new Date().toISOString();
      const hashSimulado = Buffer.from(`${serie}-${correlativo}-${totalFinal}-${ahora}`).toString('base64').substring(0, 28);
      const qrUrl = `https://sunat.gob.pe/cpe?ruc=20601234567&tipo=${body.tipoComprobante === 'FACTURA' ? '01' : '03'}&serie=${serie}&numero=${correlativo}&monto=${totalFinal}&fecha=${ahora.substring(0, 10)}`;

      // Si la venta es al crédito, actualizar saldo deudor del cliente
      if (body.medioPago === 'CREDITO' && clienteVenta) {
        clienteVenta.saldoDeudor = Number(((clienteVenta.saldoDeudor || 0) + totalFinal).toFixed(2));
      }

      const nuevaVenta = {
        id: VENTAS.length + 1,
        sucursalId: body.sucursalId || 1,
        cajaId: body.cajaId || 1,
        sesionCajaId: SESION_CAJA_ACTUAL ? SESION_CAJA_ACTUAL.id : 1,
        usuarioId: 1,
        usuarioVendedorId: 1,
        vendedorNombre: 'Administrador Farma Ochenta',
        nombreVendedor: 'Administrador Farma Ochenta',
        cliente: clienteVenta,
        tipoComprobante: body.tipoComprobante || 'BOLETA',
        serieComprobante: serie,
        numeroComprobante: correlativo,
        subtotal: subtotalBase,
        montoDescuento: montoDescuentoTotal,
        descuentoTotal: montoDescuentoTotal,
        igv: igv,
        total: totalFinal,
        medioPago: body.medioPago || 'EFECTIVO',
        montoEfectivo: montoRecibido,
        montoRecibido: montoRecibido,
        montoVuelto: vuelto,
        vuelto: vuelto,
        promocionId: body.promocionId,
        cuponCodigo: body.cuponCodigo,
        estado: 'COMPLETADA',
        estadoSunat: 'ACEPTADA',
        hashCpe: hashSimulado,
        qrCodeUrl: qrUrl,
        fechaHora: ahora,
        fechaVenta: ahora,
        observaciones: body.observaciones || '',
        detalles: detallesVenta,
        items: detallesVenta
      };
      VENTAS.unshift(nuevaVenta);
      return sendJson(res, 201, nuevaVenta);
    }

    // ==========================================
    // 6. COMPRAS (ms-compras)
    // ==========================================
        if (pathname === '/api/compras/proveedores' && req.method === 'GET') {
      return sendJson(res, 200, PROVEEDORES);
    }

    if (pathname.match(/^\/api\/compras\/proveedores\/\d+$/) && req.method === 'GET') {
      const id = parseInt(pathname.split('/')[4]);
      const prov = PROVEEDORES.find(p => p.id === id);
      if (prov) return sendJson(res, 200, prov);
      return sendJson(res, 404, { message: 'Proveedor no encontrado' });
    }

    if (pathname === '/api/compras/proveedores' && req.method === 'POST') {
      const body = await parseBody(req);
      const nuevo = {
        id: PROVEEDORES.length + 1,
        ruc: body.ruc,
        razonSocial: body.razonSocial,
        nombreContacto: body.nombreContacto,
        telefono: body.telefono,
        email: body.email,
        direccion: body.direccion,
        activo: true,
        creadoEn: new Date().toISOString()
      };
      PROVEEDORES.push(nuevo);
      return sendJson(res, 201, nuevo);
    }

    if (pathname.match(/^\/api\/compras\/proveedores\/\d+$/) && req.method === 'PUT') {
      const id = parseInt(pathname.split('/')[4]);
      const body = await parseBody(req);
      const prov = PROVEEDORES.find(p => p.id === id);
      if (prov) Object.assign(prov, body);
      return sendJson(res, 200, prov);
    }

    if (pathname.match(/^\/api\/compras\/proveedores\/\d+$/) && req.method === 'DELETE') {
      const id = parseInt(pathname.split('/')[4]);
      const prov = PROVEEDORES.find(p => p.id === id);
      if (prov) prov.activo = false;
      return sendJson(res, 204, {});
    }

        if (pathname === '/api/compras/ordenes' && req.method === 'GET') {
      return sendJson(res, 200, ORDENES);
    }

    if (pathname.match(/^\/api\/compras\/ordenes\/\d+$/) && req.method === 'GET') {
      const id = parseInt(pathname.split('/')[4]);
      const orden = ORDENES.find(o => o.id === id);
      if (orden) return sendJson(res, 200, orden);
      return sendJson(res, 404, { message: 'Orden de compra no encontrada' });
    }

    if (pathname === '/api/compras/ordenes' && req.method === 'POST') {
      const body = await parseBody(req);
      const prov = PROVEEDORES.find(p => p.id === body.proveedorId) || PROVEEDORES[0];
      const inputDetalles = body.detalles || body.items || [];
      const itemsConSubtotal = inputDetalles.map((d, idx) => ({
        id: idx + 1,
        productoId: d.productoId,
        nombreProducto: (PRODUCTOS.find(p => p.id === d.productoId) || {}).nombre || 'Producto',
        cantidadSolicitada: d.cantidadSolicitada,
        costoPactado: d.costoPactado,
        subtotal: Number((d.cantidadSolicitada * d.costoPactado).toFixed(2))
      }));
      const subtotal = itemsConSubtotal.reduce((acc, it) => acc + it.subtotal, 0);

      const nuevaOrden = {
        id: ORDENES.length + 1,
        numeroOrden: `OC-2026-${String(ORDENES.length + 1).padStart(4, '0')}`,
        proveedor: prov,
        sucursalId: 1,
        estado: 'PENDIENTE',
        subtotal: parseFloat(subtotal.toFixed(2)),
        igv: parseFloat((subtotal * 0.18).toFixed(2)),
        total: parseFloat((subtotal * 1.18).toFixed(2)),
        usuarioCreadorId: 1,
        fechaEmision: new Date().toISOString(),
        fechaEsperada: body.fechaEsperada || new Date().toISOString(),
        observaciones: body.observaciones || '',
        detalles: itemsConSubtotal,
        items: itemsConSubtotal
      };
      ORDENES.unshift(nuevaOrden);
      return sendJson(res, 201, nuevaOrden);
    }

    if (pathname.match(/^\/api\/compras\/ordenes\/\d+\/estado$/) && req.method === 'PATCH') {
      const id = parseInt(pathname.split('/')[4]);
      const orden = ORDENES.find(o => o.id === id);
      if (orden) orden.estado = query.nuevoEstado || 'APROBADA';
      return sendJson(res, 200, orden);
    }

        if (pathname === '/api/compras/ingresos' && req.method === 'GET') {
      return sendJson(res, 200, INGRESOS);
    }

    if (pathname.match(/^\/api\/compras\/ingresos\/\d+$/) && req.method === 'GET') {
      const id = parseInt(pathname.split('/')[4]);
      const ing = INGRESOS.find(i => i.id === id);
      if (ing) return sendJson(res, 200, ing);
      return sendJson(res, 404, { message: 'Ingreso no encontrado' });
    }

    if (pathname === '/api/compras/ingresos' && req.method === 'POST') {
      const body = await parseBody(req);
      const inputItems = body.items || body.detalles || [];
      const detallesIngreso = inputItems.map((it, idx) => {
        const prod = PRODUCTOS.find(p => p.id === it.productoId);
        return {
          id: idx + 1,
          productoId: it.productoId,
          nombreProducto: prod ? prod.nombre : `Producto #${it.productoId}`,
          numeroLote: it.numeroLote,
          fechaVencimiento: it.fechaVencimiento,
          cantidadRecibida: it.cantidadRecibida,
          costoUnitarioReal: it.costoUnitarioReal || it.costoUnitario || 1.0
        };
      });

      const nuevoIngreso = {
        id: INGRESOS.length + 1,
        numeroGuia: body.numeroGuia || body.numeroGuiaRemision || `GR-${Date.now().toString().slice(-6)}`,
        numeroFacturaProveedor: body.numeroFacturaProveedor || '',
        ordenCompraId: body.ordenCompraId,
        numeroOrdenCompra: body.ordenCompraId ? `OC-2026-${String(body.ordenCompraId).padStart(4, '0')}` : undefined,
        sucursalId: 1,
        usuarioRecepcionId: 1,
        fechaRecepcion: new Date().toISOString(),
        fechaIngreso: new Date().toISOString(),
        observaciones: body.observaciones || '',
        detalles: detallesIngreso,
        items: detallesIngreso
      };

      // Registrar los lotes nuevos en inventario y Kardex
      detallesIngreso.forEach(it => {
        const nuevoLote = {
          id: LOTES.length + 1,
          productoId: it.productoId,
          sucursalId: 1,
          numeroLote: it.numeroLote,
          fechaVencimiento: it.fechaVencimiento,
          cantidadInicial: it.cantidadRecibida,
          cantidadActual: it.cantidadRecibida,
          costoUnitario: it.costoUnitarioReal,
          estado: 'DISPONIBLE',
          diasRestantes: Math.max(1, Math.round((new Date(it.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))),
          semaforoVencimiento: 'VERDE'
        };
        LOTES.push(nuevoLote);

        const st = STOCK.find(s => s.productoId === it.productoId);
        if (st) {
          st.stockActual += it.cantidadRecibida;
        }

        KARDEX.unshift({
          id: KARDEX.length + 1,
          productoId: it.productoId,
          loteId: nuevoLote.id,
          numeroLote: it.numeroLote,
          sucursalId: 1,
          tipoMovimiento: 'INGRESO_COMPRA',
          cantidad: it.cantidadRecibida,
          saldoResultante: st ? st.stockActual : it.cantidadRecibida,
          referenciaTipo: 'GUIA_REMISION',
          referenciaId: nuevoIngreso.numeroGuia,
          motivo: 'Ingreso físico de mercadería',
          usuarioId: 1,
          fechaHora: new Date().toISOString()
        });
      });

      INGRESOS.unshift(nuevoIngreso);
      return sendJson(res, 201, nuevoIngreso);
    }

    // ==========================================
    // 7. FACTURACIÓN ELECTRÓNICA SUNAT (ms-sunat)
    // ==========================================
    if ((pathname === '/api/sunat/health' || pathname === '/sunat/health') && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'UP',
        service: 'ms-sunat-php',
        ambiente: 'BETA',
        emisor_ruc: '20601234567',
        greenter_disponible: true,
        timestamp: new Date().toISOString()
      });
    }

    if ((pathname === '/api/sunat/factura' || pathname === '/sunat/factura') && req.method === 'POST') {
      const body = await parseBody(req);
      const serie = body.serie || (body.tipoComprobante === 'FACTURA' ? 'F001' : 'B001');
      const numero = String(body.numero || '1').padStart(8, '0');
      const hashSimulado = Buffer.from(`${serie}-${numero}-${body.total || '0'}-${Date.now()}`).toString('base64').substring(0, 28);

      return sendJson(res, 200, {
        estadoSunat: 'ACEPTADA',
        codigoRespuesta: '0',
        descripcion: `La ${body.tipoComprobante || 'BOLETA'} número ${serie}-${numero} ha sido aceptada por SUNAT`,
        serie: serie,
        numero: numero,
        hashCpe: hashSimulado,
        qrCodeUrl: `https://sunat.gob.pe/cpe?ruc=20601234567&tipo=03&serie=${serie}&numero=${numero}&monto=${body.total || 0}`,
        cdrZip: 'UEsDBAoAAAAAA...',
        fechaRespuesta: new Date().toISOString()
      });
    }

    // Ruta 404
    console.warn(`[404] Ruta no mapeada: ${req.method} ${pathname}`);
    return sendJson(res, 404, {
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'Not Found',
      message: `Ruta ${pathname} no encontrada en Gateway`
    });

  } catch (err) {
    console.error('Error interno del servidor mock:', err);
    return sendJson(res, 500, {
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` FarmaGest API Gateway (Mock Completo) en http://localhost:${PORT}`);
  console.log(` Soporte total de endpoints para todos los módulos de FarmaGest`);
  console.log(`=======================================================`);
});
