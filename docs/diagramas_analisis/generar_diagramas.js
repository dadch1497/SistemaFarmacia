const fs = require('fs');
const path = require('path');

// Read exact actor PNG as base64
const actorPngBase64 = fs.readFileSync(path.join(__dirname, 'actor_exacto.png')).toString('base64');
const actorDataUri = `data:image/png;base64,${actorPngBase64}`;

// Helper to render BCE SVG
function createDiagram({
  width = 850,
  height = 420,
  actor = { name: 'Vendedor', x: 65, y: 190 },
  boundaries = [],
  control = { name: 'CC_Venta', x: 440, y: 190 },
  entities = []
}) {
  let linesSvg = '';
  let elementsSvg = '';

  // Lines: Actor to Boundaries (start from actor right side)
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

  // Render Actor (Exact pixel replica from user's image)
  elementsSvg += `
    <!-- Actor: ${actor.name} -->
    <g transform="translate(${actor.x}, ${actor.y})">
      <!-- Exact Actor PNG (66x136) centered vertically -->
      <image href="${actorDataUri}" x="-33" y="-68" width="66" height="136" preserveAspectRatio="xMidYMid meet"/>
      <!-- Label: plain bold black text, centered, identical font -->
      <text x="0" y="85" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">${actor.name}</text>
    </g>
  `;

  // Render Boundaries
  boundaries.forEach(b => {
    elementsSvg += `
      <!-- Boundary: ${b.name} -->
      <g transform="translate(${b.x}, ${b.y})">
        <!-- Vertical Bar & connector -->
        <line x1="-24" y1="-18" x2="-24" y2="18" stroke="#374151" stroke-width="2"/>
        <line x1="-24" y1="0" x2="-14" y2="0" stroke="#374151" stroke-width="1.8"/>
        <!-- Circle -->
        <circle cx="0" cy="0" r="16" fill="url(#sphereGrad)" stroke="#375a7f" stroke-width="1.5"/>
        <!-- Label -->
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
      <!-- Arrow on top -->
      <path d="M-8,-16 C-4,-23 5,-23 9,-16" fill="none" stroke="#374151" stroke-width="1.8"/>
      <polygon points="10,-17 9,-23 4,-19" fill="#374151"/>
      <!-- Circle -->
      <circle cx="0" cy="0" r="16" fill="url(#sphereGrad)" stroke="#375a7f" stroke-width="1.5"/>
      <!-- Label -->
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
        <!-- Horizontal base bar -->
        <line x1="-18" y1="18" x2="18" y2="18" stroke="#374151" stroke-width="2"/>
        <!-- Circle -->
        <circle cx="0" cy="0" r="16" fill="url(#sphereGrad)" stroke="#375a7f" stroke-width="1.5"/>
        <!-- Label -->
        <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="bold" fill="#111827" text-anchor="middle">${e.name}</text>
        <line x1="-${e.name.length * 3.8}" y1="36" x2="${e.name.length * 3.8}" y2="36" stroke="#9ca3af" stroke-width="0.8"/>
        <line x1="-${e.name.length * 3.8}" y1="39" x2="${e.name.length * 3.8}" y2="39" stroke="#9ca3af" stroke-width="0.8"/>
      </g>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#bfd8ef"/>
      <stop offset="45%" stop-color="#6996c5"/>
      <stop offset="90%" stop-color="#3c6591"/>
      <stop offset="100%" stop-color="#2c4d72"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  
  <!-- Connector Lines -->
  <g>
    ${linesSvg}
  </g>

  <!-- BCE Nodes -->
  <g filter="url(#shadow)">
    ${elementsSvg}
  </g>
</svg>`;
}

// 1. Registrar Venta POS
const d1 = createDiagram({
  width: 820,
  height: 380,
  actor: { name: 'Vendedor', x: 60, y: 180 },
  boundaries: [
    { name: 'CI_Menu_Principal', x: 230, y: 90 },
    { name: 'CI_Registrar_Venta_POS', x: 230, y: 270 }
  ],
  control: { name: 'CC_Venta', x: 440, y: 180 },
  entities: [
    { name: 'Venta', x: 680, y: 60 },
    { name: 'Detalle_Venta', x: 680, y: 130 },
    { name: 'Producto', x: 680, y: 200 },
    { name: 'Comprobante_Pago', x: 680, y: 270 },
    { name: 'Cliente', x: 680, y: 340 }
  ]
});

// 2. Aperturar Turno de Caja
const d2 = createDiagram({
  width: 800,
  height: 360,
  actor: { name: 'Vendedor', x: 60, y: 180 },
  boundaries: [
    { name: 'CI_Menu_Principal', x: 230, y: 95 },
    { name: 'CI_Apertura_Caja', x: 230, y: 265 }
  ],
  control: { name: 'CC_Caja', x: 440, y: 180 },
  entities: [
    { name: 'Sesion_Caja', x: 680, y: 80 },
    { name: 'Caja_Fisica', x: 680, y: 180 },
    { name: 'Usuario', x: 680, y: 280 }
  ]
});

// 3. Registrar Ingreso de Mercadería (Almacén)
const d3 = createDiagram({
  width: 820,
  height: 370,
  actor: { name: 'Almacenero', x: 60, y: 180 },
  boundaries: [
    { name: 'CI_Menu_Principal', x: 230, y: 95 },
    { name: 'CI_Ingreso_Mercaderia', x: 230, y: 265 }
  ],
  control: { name: 'CC_Recepcion', x: 440, y: 180 },
  entities: [
    { name: 'Guia_Recepcion', x: 680, y: 70 },
    { name: 'Lote_Producto', x: 680, y: 150 },
    { name: 'Orden_Compra', x: 680, y: 230 },
    { name: 'Kardex', x: 680, y: 310 }
  ]
});

// 4. Generar Orden de Compra
const d4 = createDiagram({
  width: 820,
  height: 370,
  actor: { name: 'Almacenero', x: 60, y: 180 },
  boundaries: [
    { name: 'CI_Menu_Principal', x: 230, y: 95 },
    { name: 'CI_Orden_Compra', x: 230, y: 265 }
  ],
  control: { name: 'CC_Compra', x: 440, y: 180 },
  entities: [
    { name: 'Orden_Compra', x: 680, y: 70 },
    { name: 'Detalle_Orden', x: 680, y: 150 },
    { name: 'Proveedor', x: 680, y: 230 },
    { name: 'Producto', x: 680, y: 310 }
  ]
});

// 5. Registrar Devolución de Mercadería
const d5 = createDiagram({
  width: 820,
  height: 380,
  actor: { name: 'Almacenero', x: 60, y: 180 },
  boundaries: [
    { name: 'CI_Menu_Principal', x: 230, y: 95 },
    { name: 'CI_Registrar_Devolucion', x: 230, y: 265 }
  ],
  control: { name: 'CC_Devolucion', x: 440, y: 180 },
  entities: [
    { name: 'Devolucion', x: 680, y: 60 },
    { name: 'Producto', x: 680, y: 130 },
    { name: 'Lote', x: 680, y: 200 },
    { name: 'Kardex', x: 680, y: 270 },
    { name: 'Proveedor', x: 680, y: 340 }
  ]
});

const outDir = path.resolve(__dirname);
const artifactDir = 'C:/Users/SERVER1497/.gemini/antigravity/brain/715ee272-d5a1-4ce0-b072-7acd61c37836';

const files = [
  ['01_Registrar_Venta_POS.svg', d1],
  ['02_Aperturar_Caja.svg', d2],
  ['03_Registrar_Ingreso_Mercaderia.svg', d3],
  ['04_Generar_Orden_Compra.svg', d4],
  ['05_Registrar_Devolucion_Mercaderia.svg', d5]
];

files.forEach(([name, content]) => {
  fs.writeFileSync(path.join(outDir, name), content, 'utf8');
  fs.writeFileSync(path.join(artifactDir, name), content, 'utf8');
});

console.log('Diagramas SVG generados exitosamente en ambos directorios.');
