const fs = require('fs');
const path = require('path');

// Read exact actor PNG as base64
const actorPngBase64 = fs.readFileSync(path.join(__dirname, 'actor_exacto.png')).toString('base64');
const actorDataUri = `data:image/png;base64,${actorPngBase64}`;

function createDiagram({
  width = 850,
  actorName = 'Vendedor',
  ciNames = ['CI_Menu_Principal', 'CI_Operacion'],
  ccName = 'CC_Operacion',
  entityNames = []
}) {
  const count = entityNames.length;
  let height = 380;
  let entityYs = [];

  if (count === 3) {
    height = 380;
    entityYs = [90, 190, 290];
  } else if (count === 4) {
    height = 380;
    entityYs = [65, 145, 225, 305];
  } else if (count === 5) {
    height = 410;
    entityYs = [55, 125, 195, 265, 335];
  } else {
    height = 420;
    const step = 320 / (count - 1);
    for (let i = 0; i < count; i++) entityYs.push(50 + i * step);
  }

  const centerY = Math.round(height / 2);
  const actor = { name: actorName, x: 65, y: centerY };
  const boundaries = [
    { name: ciNames[0], x: 235, y: centerY - 90 },
    { name: ciNames[1], x: 235, y: centerY + 90 }
  ];
  const control = { name: ccName, x: 440, y: centerY };
  const entities = entityNames.map((name, i) => ({ name, x: 690, y: entityYs[i] }));

  let linesSvg = '';
  let elementsSvg = '';

  // Lines: Actor to Boundaries
  boundaries.forEach(b => {
    linesSvg += `<line x1="${actor.x + 28}" y1="${actor.y}" x2="${b.x - 24}" y2="${b.y}" stroke="#737373" stroke-width="1.1"/>\n`;
  });

  // Lines: Boundaries to Control
  boundaries.forEach(b => {
    linesSvg += `<line x1="${b.x + 20}" y1="${b.y}" x2="${control.x - 20}" y2="${control.y}" stroke="#737373" stroke-width="1.1"/>\n`;
  });

  // Lines: Control to Entities
  entities.forEach(e => {
    linesSvg += `<line x1="${control.x + 20}" y1="${control.y}" x2="${e.x - 20}" y2="${e.y}" stroke="#737373" stroke-width="1.1"/>\n`;
  });

  // Render Actor (Exact PNG from reference)
  elementsSvg += `
    <!-- Actor: ${actor.name} -->
    <g transform="translate(${actor.x}, ${actor.y})">
      <image href="${actorDataUri}" x="-33" y="-68" width="66" height="136" preserveAspectRatio="xMidYMid meet"/>
      <text x="0" y="85" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">${actor.name}</text>
    </g>
  `;

  // Render Boundaries
  boundaries.forEach(b => {
    elementsSvg += `
      <!-- Boundary: ${b.name} -->
      <g transform="translate(${b.x}, ${b.y})">
        <line x1="-24" y1="-18" x2="-24" y2="18" stroke="#374151" stroke-width="2"/>
        <line x1="-24" y1="0" x2="-14" y2="0" stroke="#374151" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="16" fill="url(#sphereGrad)" stroke="#375a7f" stroke-width="1.5"/>
        <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="bold" fill="#111827" text-anchor="middle">${b.name}</text>
        <line x1="-${b.name.length * 3.8}" y1="36" x2="${b.name.length * 3.8}" y2="36" stroke="#9ca3af" stroke-width="0.8"/>
        <line x1="-${b.name.length * 3.8}" y1="39" x2="${b.name.length * 3.8}" y2="39" stroke="#9ca3af" stroke-width="0.8"/>
      </g>
    `;
  });

  // Render Control
  elementsSvg += `
    <!-- Control: ${control.name} -->
    <g transform="translate(${control.x}, ${control.y})">
      <path d="M-8,-16 C-4,-23 5,-23 9,-16" fill="none" stroke="#374151" stroke-width="1.8"/>
      <polygon points="10,-17 9,-23 4,-19" fill="#374151"/>
      <circle cx="0" cy="0" r="16" fill="url(#sphereGrad)" stroke="#375a7f" stroke-width="1.5"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="bold" fill="#111827" text-anchor="middle">${control.name}</text>
      <line x1="-${control.name.length * 3.8}" y1="36" x2="${control.name.length * 3.8}" y2="36" stroke="#9ca3af" stroke-width="0.8"/>
      <line x1="-${control.name.length * 3.8}" y1="39" x2="${control.name.length * 3.8}" y2="39" stroke="#9ca3af" stroke-width="0.8"/>
    </g>
  `;

  // Render Entities
  entities.forEach(e => {
    elementsSvg += `
      <!-- Entity: ${e.name} -->
      <g transform="translate(${e.x}, ${e.y})">
        <line x1="-18" y1="18" x2="18" y2="18" stroke="#374151" stroke-width="2"/>
        <circle cx="0" cy="0" r="16" fill="url(#sphereGrad)" stroke="#375a7f" stroke-width="1.5"/>
        <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="bold" fill="#111827" text-anchor="middle">${e.name}</text>
        <line x1="-${e.name.length * 3.8}" y1="36" x2="${e.name.length * 3.8}" y2="36" stroke="#9ca3af" stroke-width="0.8"/>
        <line x1="-${e.name.length * 3.8}" y1="39" x2="${e.name.length * 3.8}" y2="39" stroke="#9ca3af" stroke-width="0.8"/>
      </g>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <radialGradient id="sphereGrad" cx="38%" cy="32%" r="62%">
      <stop offset="0%" stop-color="#b8cee0"/>
      <stop offset="40%" stop-color="#7297b8"/>
      <stop offset="85%" stop-color="#496d91"/>
      <stop offset="100%" stop-color="#345475"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <g>${linesSvg}</g>
  <g filter="url(#shadow)">${elementsSvg}</g>
</svg>`;
}

const diagramas = [
  // 1. VENTAS Y POS
  {
    file: '01_Registrar_Venta_POS.svg',
    actorName: 'Vendedor',
    ciNames: ['CI_Menu_Principal', 'CI_Registrar_Venta_POS'],
    ccName: 'CC_Venta',
    entityNames: ['Venta', 'Detalle_Venta', 'Producto', 'Comprobante_Pago', 'Cliente']
  },
  {
    file: '02_Aperturar_Caja.svg',
    actorName: 'Vendedor',
    ciNames: ['CI_Menu_Principal', 'CI_Apertura_Caja'],
    ccName: 'CC_Caja',
    entityNames: ['Sesion_Caja', 'Caja_Fisica', 'Usuario']
  },
  {
    file: '03_Cerrar_Caja_Arqueo.svg',
    actorName: 'Vendedor',
    ciNames: ['CI_Menu_Principal', 'CI_Cierre_Caja'],
    ccName: 'CC_Cierre_Caja',
    entityNames: ['Sesion_Caja', 'Arqueo_Fisico', 'Resumen_Ventas']
  },
  {
    file: '04_Consultar_Comprobantes.svg',
    actorName: 'Vendedor',
    ciNames: ['CI_Menu_Principal', 'CI_Consultar_Comprobantes'],
    ccName: 'CC_Comprobante',
    entityNames: ['Comprobante_Pago', 'Boleta', 'Factura', 'Venta']
  },

  // 2. INVENTARIO Y ALMACÉN
  {
    file: '05_Registrar_Ingreso_Mercaderia.svg',
    actorName: 'Almacenero',
    ciNames: ['CI_Menu_Principal', 'CI_Ingreso_Mercaderia'],
    ccName: 'CC_Recepcion',
    entityNames: ['Guia_Recepcion', 'Lote_Producto', 'Orden_Compra', 'Kardex']
  },
  {
    file: '06_Consultar_Kardex_Inventario.svg',
    actorName: 'Almacenero',
    ciNames: ['CI_Menu_Principal', 'CI_Kardex_Inventario'],
    ccName: 'CC_Kardex',
    entityNames: ['Kardex', 'Producto', 'Lote_Producto', 'Movimiento_Stock']
  },
  {
    file: '07_Alertas_Stock_Caducidad.svg',
    actorName: 'Almacenero',
    ciNames: ['CI_Menu_Principal', 'CI_Alertas_Inventario'],
    ccName: 'CC_Alertas',
    entityNames: ['Alerta_Stock', 'Producto', 'Lote_Producto', 'Parametro_Almacen']
  },
  {
    file: '08_Registrar_Devolucion_Mercaderia.svg',
    actorName: 'Almacenero',
    ciNames: ['CI_Menu_Principal', 'CI_Registrar_Devolucion'],
    ccName: 'CC_Devolucion',
    entityNames: ['Devolucion', 'Producto', 'Lote', 'Kardex', 'Proveedor']
  },

  // 3. COMPRAS Y PROVEEDORES
  {
    file: '09_Generar_Orden_Compra.svg',
    actorName: 'Almacenero',
    ciNames: ['CI_Menu_Principal', 'CI_Orden_Compra'],
    ccName: 'CC_Compra',
    entityNames: ['Orden_Compra', 'Detalle_Orden', 'Proveedor', 'Producto']
  },
  {
    file: '10_Mantener_Proveedores.svg',
    actorName: 'Administrador',
    ciNames: ['CI_Menu_Principal', 'CI_Mantener_Proveedor'],
    ccName: 'CC_Proveedor',
    entityNames: ['Proveedor', 'Laboratorio', 'Contacto_Proveedor']
  },

  // 4. CATÁLOGO Y PRECIOS
  {
    file: '11_Registrar_Medicamento.svg',
    actorName: 'Administrador',
    ciNames: ['CI_Menu_Principal', 'CI_Registrar_Medicamento'],
    ccName: 'CC_Catalogo',
    entityNames: ['Producto', 'Categoria', 'Laboratorio', 'Presentacion']
  },
  {
    file: '12_Actualizar_Precio_Producto.svg',
    actorName: 'Administrador',
    ciNames: ['CI_Menu_Principal', 'CI_Actualizar_Precio'],
    ccName: 'CC_Precio',
    entityNames: ['Producto', 'Historial_Precio', 'Usuario_Auditor']
  },

  // 5. SEGURIDAD Y ACCESO
  {
    file: '13_Iniciar_Sesion.svg',
    actorName: 'Usuario',
    ciNames: ['CI_Login_Principal', 'CI_Recuperar_Acceso'],
    ccName: 'CC_Autenticacion',
    entityNames: ['Usuario', 'Credencial', 'Rol', 'Token_JWT']
  },
  {
    file: '14_Administrar_Usuarios.svg',
    actorName: 'Administrador',
    ciNames: ['CI_Menu_Principal', 'CI_Administrar_Usuarios'],
    ccName: 'CC_Usuario',
    entityNames: ['Usuario', 'Rol', 'Permiso', 'Empleado']
  },

  // 6. REPORTES Y ANALÍTICA
  {
    file: '15_Generar_Reporte_Ventas.svg',
    actorName: 'Administrador',
    ciNames: ['CI_Menu_Principal', 'CI_Reporte_Gerencial'],
    ccName: 'CC_Reporte',
    entityNames: ['Reporte_Ventas', 'Venta', 'Detalle_Venta', 'Metrica_Rentabilidad']
  }
];

const outDir = path.resolve(__dirname);
const artifactDir = 'C:/Users/SERVER1497/.gemini/antigravity/brain/715ee272-d5a1-4ce0-b072-7acd61c37836';

diagramas.forEach(d => {
  const svg = createDiagram(d);
  fs.writeFileSync(path.join(outDir, d.file), svg, 'utf8');
  fs.writeFileSync(path.join(artifactDir, d.file), svg, 'utf8');
});

console.log(`¡Los ${diagramas.length} diagramas del sistema completo fueron generados exitosamente!`);
