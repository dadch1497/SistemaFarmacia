const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { of, throwError, Subject, firstValueFrom, takeUntil, timeout } = require('rxjs');

function load(file, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src/app', file), 'utf8').replace(/^import[\s\S]*?;\r?\n/gm, '');
  class Output { values = []; emit(value) { this.values.push(value); } }
  const context = { exports: {}, require, URL, File, Blob, FormData, Subject, firstValueFrom, takeUntil, timeout, AbortController, DOMException, setTimeout, clearTimeout,
    Component: () => target => target, Injectable: () => target => target,
    Input: () => () => {}, Output: () => () => {}, ViewChild: () => () => {}, EventEmitter: Output,
    CommonModule: {}, FormsModule: {}, BarcodePhotoComponent: {}, RecepcionDocumentoComponent: {}, GuiaAdjuntaComponent: {}, GuiaCompraComponent: {},
    signal: initial => { let value = initial; return Object.assign(() => value, { set: next => value = next, update: fn => value = fn(value) }); },
    ...globals };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true } }).outputText, context);
  return context.exports;
}
const model = load('core/models/recepcion-documento.ts');
const { analizarDocumento, filaVacia, numeroDocumento, fechaDocumento, vincularFilas, erroresFila, compararDocumento } = model;
const { RecepcionDocumentoComponent: Panel } = load('shared/recepcion-documento/recepcion-documento.component.ts', model);
const { ComprasComponent: Compras } = load('pages/compras/compras.component.ts', model);
const { DocumentoOcrService: Ocr } = load('core/services/documento-ocr.service.ts');
const productos = [{ id: 1, nombre: 'Champú 400 ml', codigoBarras: '0012345678905', presentacion: 'Unidad', activo: true }];
const orden = { id: 5, numeroOrden: 'OC-5', estado: 'APROBADA', proveedor: { ruc: '20123456789' }, detalles: [
  { productoId: 1, nombreProducto: 'Champú 400 ml', cantidadSolicitada: 20, costoPactado: 8 },
  { productoId: 2, nombreProducto: 'Jabón', cantidadSolicitada: 5, costoPactado: 3 }
] };
const texto = `PROVEEDOR: Distribuidora Demo
RUC: 20123456789
GUIA DE REMISION T001-0000123
FACTURA F001-0000456
Codigo | Descripcion | Cantidad | Costo | Lote | Vencimiento | Importe
0012345678905 | Champu 400 ml | 18 | 8,00 | LOTE-REAL | 31/12/2028 | 144.00
TOTAL 144.00`;

test('extracts explicit document fields and headed columns while preserving barcode zeros', () => {
  const doc = analizarDocumento(texto);
  assert.equal(doc.guia, 'T001-0000123'); assert.equal(doc.factura, 'F001-0000456');
  assert.equal(doc.ruc, '20123456789'); assert.equal(doc.filas.length, 1);
  assert.equal(doc.filas[0].codigo, '0012345678905');
  assert.equal(doc.filas[0].cantidad, 18); assert.equal(doc.filas[0].costo, 8);
  assert.equal(doc.filas[0].lote, 'LOTE-REAL'); assert.equal(doc.filas[0].vencimiento, '2028-12-31');
});
test('never interprets line totals as unit costs or fabricates missing batch data', () => {
  const doc = analizarDocumento('Descripcion | Cantidad | Importe\nChampu 400 ml | 18 | 144.00');
  const fila = doc.filas[0];
  assert.equal(fila.costo, null); assert.equal(fila.lote, ''); assert.equal(fila.vencimiento, '');
  assert.ok(erroresFila(fila).length >= 3);
  assert.equal(analizarDocumento('Champu 400 ml 18 8.00 LOTE 31/12/2028').filas.length, 0);
});
test('handles physical OCR word coordinates and ignores totals', () => {
  const row = (parts) => ({ texto: parts.map(p => p[0]).join(' '), palabras: parts.map(([texto, x]) => ({ texto, x })) });
  const doc = analizarDocumento('', [
    row([['Descripcion', 20], ['Cantidad', 400], ['Costo', 500], ['Lote', 600], ['Vencimiento', 750]]),
    row([['Champu', 20], ['400', 100], ['ml', 150], ['18', 425], ['8.00', 515], ['LOTE-REAL', 600], ['31/12/2028', 750]]),
    row([['TOTAL', 20], ['144.00', 500]])
  ]);
  assert.equal(doc.filas.length, 1); assert.equal(doc.filas[0].descripcion, 'Champu 400 ml');
  assert.equal(doc.filas[0].cantidad, 18); assert.equal(doc.filas[0].costo, 8);
});
test('rejects ambiguous amounts, invalid calendar dates, noninteger quantities and shifted rows', () => {
  assert.equal(numeroDocumento('1,234'), null); assert.equal(numeroDocumento('S/ 1.234,50'), null);
  assert.equal(numeroDocumento('S/ 8,50'), 8.5);
  assert.equal(fechaDocumento('31/02/2028'), ''); assert.equal(fechaDocumento('12/2028'), '');
  assert.equal(fechaDocumento('29/02/2028'), '2028-02-29');
  assert.equal(analizarDocumento('Descripcion | Cantidad | Costo\nChampu | 4').filas.length, 0);
  assert.ok(erroresFila({ ...filaVacia(), productoId: 1, cantidad: 1.5, costo: 2, lote: 'L', vencimiento: '2028-12-31' }).some(e => e.includes('entera')));
});
test('matches unique exact code or normalized name; ambiguous and inactive products stay unlinked', () => {
  const doc = analizarDocumento(texto);
  vincularFilas(doc.filas, productos); assert.equal(doc.filas[0].productoId, 1);
  vincularFilas(doc.filas, [...productos, { ...productos[0], id: 9 }]); assert.equal(doc.filas[0].productoId, null);
  vincularFilas(doc.filas, [{ ...productos[0], activo: false }]); assert.equal(doc.filas[0].productoId, null);
  doc.filas[0].codigo = ''; vincularFilas(doc.filas, productos); assert.equal(doc.filas[0].productoId, 1);
  doc.filas[0].descripcion = 'Champu'; vincularFilas(doc.filas, productos); assert.equal(doc.filas[0].productoId, null);
});
test('compares aggregated lots and reports missing, extra, supplier and cost discrepancies', () => {
  const doc = analizarDocumento(texto); vincularFilas(doc.filas, productos);
  const diff = compararDocumento(doc, orden);
  assert.ok(diff.some(d => d.includes('faltan 2'))); assert.ok(diff.some(d => d.includes('Jabón') && d.includes('faltan 5')));
  doc.filas.push({ ...doc.filas[0], cantidad: 2 });
  assert.ok(!compararDocumento(doc, orden).some(d => d.includes('Champu') && d.includes('faltan')));
  doc.ruc = '20999999999'; doc.filas[0].costo = 9;
  doc.filas.push({ ...doc.filas[0], productoId: 8 });
  const cambios = compararDocumento(doc, orden);
  assert.ok(cambios.some(d => d.includes('RUC'))); assert.ok(cambios.some(d => d.includes('costo unitario'))); assert.ok(cambios.some(d => d.includes('no está')));
});
test('applying requires review, valid fields and discrepancy acknowledgement; never writes stock', () => {
  const panel = new Panel({}, {}); panel.documento = analizarDocumento(texto); panel.productos = productos;
  panel.ordenes = [orden]; panel.ordenId = 5; panel.vincular();
  panel.aplicar(); assert.equal(panel.preparado.values.length, 0);
  panel.revisado = true; panel.aplicar(); assert.equal(panel.preparado.values.length, 0);
  panel.diferenciasRevisadas = true; panel.aplicar(); assert.equal(panel.preparado.values.length, 1);
  panel.aplicar(); assert.equal(panel.preparado.values.length, 1);
  panel.editar(); assert.equal(panel.revisado, false); assert.equal(panel.diferenciasRevisadas, false);
});
test('order cost is explicitly selectable when the guide has no cost', () => {
  const panel = new Panel({}, {}); panel.ordenes = [orden]; panel.ordenId = 5;
  const fila = { ...filaVacia(), productoId: 1 };
  assert.equal(fila.costo, null); assert.equal(panel.costoOrden(fila), 8);
  panel.usarCosto(fila); assert.equal(fila.costo, 8); assert.equal(panel.pendienteCambio.values.at(-1), true);
});
test('closing during OCR ignores late results and revokes previews', async () => {
  let finish;
  const panel = new Panel({ validar() {}, leer: () => new Promise(resolve => finish = resolve) }, {});
  const reading = panel.seleccionar({ target: { files: [new File(['test'], 'demo.png', { type: 'image/png' })], value: 'demo.png' } });
  panel.ngOnDestroy();
  finish({ texto, confianza: 90 }); await reading;
  assert.equal(panel.documento, null); assert.equal(panel.preparado.values.length, 0);
});
test('cancel, retry and discard cannot overwrite a newer draft', async () => {
  let finish;
  const panel = new Panel({ validar() {}, leer: () => new Promise(resolve => finish = resolve) }, {});
  const reading = panel.seleccionar({ target: { files: [new File(['test'], 'demo.png', { type: 'image/png' })], value: '' } });
  panel.descartar(); finish({ texto, confianza: 90 }); await reading;
  assert.equal(panel.documento, null); assert.equal(panel.preview, '');
  assert.equal(panel.pendienteCambio.values.at(-1), false);
});
test('invalid images are rejected before the OCR engine is initialized', () => {
  const ocr = new Ocr();
  for (const file of [new File(['svg'], 'a.svg', { type: 'image/svg+xml' }), new File([], 'a.png', { type: 'image/png' }), { type: 'image/png', size: 13 * 1024 * 1024 }]) assert.throws(() => ocr.validar(file));
});
test('starting an order receipt no longer invents document, batch or expiration values', () => {
  const compras = new Compras({}, {}, {}, {});
  compras.iniciarRecepcionDesdeOrden(orden);
  assert.equal(compras.ingresoForm.numeroGuia, ''); assert.equal(compras.ingresoForm.numeroFacturaProveedor, '');
  assert.equal(compras.ingresoForm.items[0].numeroLote, ''); assert.equal(compras.ingresoForm.items[0].fechaVencimiento, '');
  compras.guardarIngreso(); assert.match(compras.mensajeError(), /lote y vencimiento/);
});
test('reviewed document replaces pending rows and still requires final reception confirmation', () => {
  const compras = new Compras({}, {}, {}, {}); compras.ingresoForm.numeroGuia = 'GUIA-REAL';
  const doc = analizarDocumento(texto); vincularFilas(doc.filas, productos);
  compras.aplicarDocumentoRecepcion({ documento: doc, ordenId: 5, productos, diferencias: [] });
  assert.equal(compras.ingresoForm.items.length, 1); assert.equal(compras.ingresoForm.items[0].cantidadRecibida, 18);
  assert.equal(compras.ingresoForm.items[0].subtotal, 144); assert.equal(compras.ingresoForm.ordenCompraId, 5);
  compras.documentoPendiente = true; compras.guardarIngreso(); assert.match(compras.mensajeError(), /Aplica el documento/);
});

test('supplier code falls back to exact unique description, never to a different product', () => {
  const doc = analizarDocumento(texto); doc.filas[0].codigo = 'PROVEEDOR-001';
  vincularFilas(doc.filas, productos); assert.equal(doc.filas[0].productoId, 1);
  doc.filas[0].descripcion = 'Otro champu'; vincularFilas(doc.filas, productos);
  assert.equal(doc.filas[0].productoId, null);
});
test('automatic selection paginates the whole active catalog instead of just the first 100 products', async () => {
  const calls = [];
  const panel = new Panel({}, { listarProductos: (page, size, q, category, active) => {
    calls.push({ page, size, active });
    return of({ content: page === 0 ? [{ id: 99, nombre: 'Otro producto', activo: true }] : productos, totalPages: 2 });
  } });
  panel.documento = analizarDocumento(texto); await panel.vincularCatalogo();
  assert.equal(calls.length, 2); assert.ok(calls.every(c => c.active === true));
  assert.equal(panel.documento.filas[0].productoId, 1); assert.equal(panel.vinculando(), false);
});
test('expired session gives an explicit catalog error and does not choose a random product', async () => {
  const panel = new Panel({}, { listarProductos: () => throwError(() => ({ status: 403 })) });
  panel.documento = analizarDocumento(texto); panel.productos = productos;
  await panel.vincularCatalogo();
  assert.match(panel.error(), /Inicia sesión/); assert.equal(panel.documento.filas[0].productoId, null);
});
test('cancelled catalog lookup ignores late responses', async () => {
  const pending = new Subject(); const panel = new Panel({}, { listarProductos: () => pending });
  panel.documento = analizarDocumento(texto); const matching = panel.vincularCatalogo();
  panel.descartar(); pending.next({ content: productos, totalPages: 1 }); await matching;
  assert.equal(panel.documento, null); assert.equal(panel.vinculando(), false);
});
test('late webcam permission after cancel stops its tracks', async () => {
  let finish; let stops = 0;
  const { RecepcionDocumentoComponent: CameraPanel } = load('shared/recepcion-documento/recepcion-documento.component.ts', {
    ...model, window: { isSecureContext: true }, navigator: { mediaDevices: { getUserMedia: () => new Promise(resolve => finish = resolve) } }
  });
  const panel = new CameraPanel({}, {}); const opening = panel.abrirCamara();
  panel.cerrarCamara(); finish({ getTracks: () => [{ stop() { stops++; } }] }); await opening;
  assert.equal(stops, 1); assert.equal(panel.camaraAbierta(), false);
});

test('PDF original stays attached independently of extracted receipt fields', async () => {
  const { GuiaAdjuntaComponent: Attachment } = load('shared/guia-adjunta/guia-adjunta.component.ts');
  const panel = new Attachment({}, {});
  const original = new File(['%PDF-1.7 sample'], 'guia-original.pdf', { type: 'application/pdf' });
  await panel.seleccionar({ target: { files: [original], value: 'guia-original.pdf' } });
  assert.equal(panel.archivo, original); assert.equal(panel.archivoCambio.values.at(-1), original);
  assert.equal(await panel.archivo.text(), '%PDF-1.7 sample');
});
test('warehouse attachment to an existing receipt does not register another stock receipt', async () => {
  const { GuiaAdjuntaComponent: Attachment } = load('shared/guia-adjunta/guia-adjunta.component.ts');
  let calls = 0;
  const panel = new Attachment({}, { adjuntarGuia: (id, file) => { assert.equal(id, 7); assert.equal(file.name, 'guia.pdf'); calls++; return of(null); } });
  panel.ingresoId = 7; panel.archivo = new File(['%PDF-1.7 sample'], 'guia.pdf', { type: 'application/pdf' });
  await panel.guardarAdjunto();
  assert.equal(calls, 1); assert.equal(panel.guardado, true); assert.equal(panel.adjuntado.values.length, 1);
});
test('PDF preview renders all provided pages and keeps the original filename', async () => {
  const { GuiaAdjuntaComponent: Attachment } = load('shared/guia-adjunta/guia-adjunta.component.ts');
  const panel = new Attachment({ imagenes: async () => ['data:image/png;base64,AA', 'data:image/png;base64,BB'] }, {});
  panel.archivo = new File(['%PDF-1.7 sample'], 'guia.pdf', { type: 'application/pdf' });
  await panel.ver(); assert.equal(panel.paginas.length, 2); assert.equal(panel.nombre, 'guia.pdf'); assert.equal(panel.abierto, true);
});
test('receipt and original file are submitted together in one multipart request', () => {
  const { ComprasService } = load('core/services/compras.service.ts');
  const service = new ComprasService({ post: (url, data) => { assert.match(url, /ingresos\/con-guia$/); assert.equal(data.get('archivo').name, 'guia.pdf'); assert.equal(data.get('registro').type, 'application/json'); return of({}); } });
  service.registrarIngreso({ numeroGuia: 'T001-1', items: [] }, new File(['%PDF-1.7 sample'], 'guia.pdf', { type: 'application/pdf' }));
});
