const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { Subject, of, throwError } = require('rxjs');

// Exercise the actual component methods without bootstrapping a browser or API.
function load(relativePath, className, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src/app', relativePath), 'utf8')
    .replace(/^import[\s\S]*?;\r?\n/gm, '');
  class Output {
    values = [];
    emit(value) { this.values.push(value); }
  }
  const context = {
    exports: {}, require, URL, File,
    Component: () => target => target, Injectable: () => target => target,
    Input: () => () => {}, Output: () => () => {}, ViewChild: () => () => {},
    CommonModule: {}, FormsModule: {}, RouterLink: {}, BarcodePhotoComponent: {},
    EventEmitter: Output,
    signal: initial => { let value = initial; return Object.assign(() => value, {
      set: next => { value = next; }, update: fn => { value = fn(value); }
    }); }, ...globals
  };
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText, context);
  return context.exports[className];
}
const Scanner = load('shared/barcode-photo/barcode-photo.component.ts', 'BarcodePhotoComponent');
const Reader = load('core/services/barcode-photo.service.ts', 'BarcodePhotoService');
const producto = { id: 155, nombre: 'Producto fuera de la primera página', codigoBarras: '0012345678905', activo: true };
const submit = { preventDefault() {} };

test('preserves leading zeroes and only emits a selected product, never a stock operation', () => {
  const calls = [];
  const scanner = new Scanner({}, { obtenerProductoPorCodigo: code => { calls.push(code); return of(producto); } });
  scanner.codigo = ' 0012345678905 ';
  scanner.buscarManual(submit);
  assert.deepEqual(calls, ['0012345678905']);
  assert.equal(scanner.producto(), producto);
  assert.equal(scanner.productoSeleccionado.values.at(-1), producto);
  assert.equal(scanner.ocupado(), false);
});

function cameraScanner(mediaDevices, extra = {}) {
  const CameraScanner = load('shared/barcode-photo/barcode-photo.component.ts', 'BarcodePhotoComponent', {
    window: { isSecureContext: true }, navigator: { mediaDevices }, ...extra
  });
  const scanner = new CameraScanner({ validarArchivo() {}, leer: async () => producto.codigoBarras, iniciarVideo: async () => ({ stop() {} }) }, {
    obtenerProductoPorCodigo: () => of(producto)
  });
  const video = { srcObject: null, play: async () => {}, pause() {}, videoWidth: 640, videoHeight: 480 };
  scanner.videoCamara = { nativeElement: video };
  return { scanner, video };
}

test('opens video without microphone and stops every track on close', async () => {
  let stops = 0;
  let constraints;
  const track = { stop: () => { stops++; }, getSettings: () => ({ deviceId: 'usb-camera' }) };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  const { scanner, video } = cameraScanner({
    getUserMedia: async value => { constraints = value; return stream; },
    enumerateDevices: async () => [{ kind: 'videoinput', deviceId: 'usb-camera', label: 'USB' }]
  });
  await scanner.abrirCamara();
  assert.equal(constraints.audio, false);
  assert.equal(scanner.camaraLista(), true);
  assert.equal(video.srcObject, stream);
  assert.equal(scanner.camaraId, 'usb-camera');
  scanner.cerrarCamara();
  assert.equal(stops, 1);
  assert.equal(video.srcObject, null);
  assert.equal(scanner.camaraAbierta(), false);
  assert.equal(scanner.ocupado(), false);
});

test('camera permission denial, unavailable camera and busy camera have specific errors', async () => {
  for (const [name, message] of [['NotAllowedError', /permiso/], ['NotFoundError', /conectada/], ['NotReadableError', /otras aplicaciones/]]) {
    const { scanner } = cameraScanner({ getUserMedia: async () => { throw { name }; } });
    await scanner.abrirCamara();
    assert.match(scanner.error(), message);
    assert.equal(scanner.camaraAbierta(), false);
    assert.equal(scanner.ocupado(), false);
  }
});

test('a camera permission resolved after cancel or destroy cannot leave the camera running', async () => {
  for (const destroy of [false, true]) {
    let finish;
    let stops = 0;
    const track = { stop: () => { stops++; } };
    const { scanner } = cameraScanner({ getUserMedia: () => new Promise(resolve => { finish = resolve; }) });
    const opening = scanner.abrirCamara();
    destroy ? scanner.ngOnDestroy() : scanner.cerrarCamara();
    finish({ getTracks: () => [track] });
    await opening;
    assert.equal(stops, 1);
    assert.equal(scanner.camaraAbierta(), false);
  }
});

test('live recognition emits once, after releasing busy state, and closes the camera', async () => {
  let callback;
  let stops = 0;
  let decoderStops = 0;
  const track = { stop: () => { stops++; }, getSettings: () => ({}) };
  const { scanner } = cameraScanner({
    getUserMedia: async () => ({ getTracks: () => [track], getVideoTracks: () => [track] }),
    enumerateDevices: async () => []
  });
  scanner.lector.iniciarVideo = async (_video, onCode) => {
    callback = onCode;
    return { stop() { decoderStops++; } };
  };
  scanner.productoEscaneado.emit = value => {
    assert.equal(scanner.ocupado(), false);
    scanner.productoEscaneado.values.push(value);
  };
  await scanner.abrirCamara();
  callback(producto.codigoBarras);
  callback(producto.codigoBarras);
  assert.equal(stops, 1);
  assert.equal(decoderStops, 1);
  assert.equal(scanner.camaraAbierta(), false);
  assert.equal(scanner.productoEscaneado.values.length, 1);
  assert.equal(scanner.productoEscaneado.values[0], producto);
});

test('late decoder initialization is stopped after camera cancellation', async () => {
  let finish;
  let stops = 0;
  const track = { stop() {}, getSettings: () => ({}) };
  const { scanner } = cameraScanner({ getUserMedia: async () => ({ getTracks: () => [track], getVideoTracks: () => [track] }) });
  scanner.lector.iniciarVideo = () => new Promise(resolve => { finish = resolve; });
  const opening = scanner.abrirCamara();
  await new Promise(resolve => setImmediate(resolve));
  scanner.cerrarCamara();
  finish({ stop() { stops++; } });
  await opening;
  assert.equal(stops, 1);
});

test('camera in insecure contexts fails without requesting permission', async () => {
  let requests = 0;
  const { scanner } = cameraScanner({ getUserMedia: async () => { requests++; } }, { window: { isSecureContext: false } });
  await scanner.abrirCamara();
  assert.equal(requests, 0);
  assert.match(scanner.error(), /HTTPS o localhost/);
});

test('distinguishes 404 from authorization and connection errors', () => {
  for (const status of [404, 401, 403, 0, 500]) {
    const scanner = new Scanner({}, { obtenerProductoPorCodigo: () => throwError(() => ({ status })) });
    scanner.codigo = '12345678';
    scanner.buscarManual(submit);
    assert.equal(scanner.noEncontrado(), status === 404);
    assert.equal(scanner.producto(), null);
    assert.ok(scanner.error().length);
    assert.equal(scanner.ocupado(), false);
  }
});

test('does not select inactive products', () => {
  const scanner = new Scanner({}, { obtenerProductoPorCodigo: () => of({ ...producto, activo: false }) });
  scanner.codigo = producto.codigoBarras;
  scanner.buscarManual(submit);
  assert.equal(scanner.producto(), null);
  assert.match(scanner.error(), /inactivo/);
  assert.equal(scanner.productoSeleccionado.values.at(-1), null);
});

test('clear cancels a pending lookup and ignores a late response', () => {
  const pending = new Subject();
  const scanner = new Scanner({}, { obtenerProductoPorCodigo: () => pending });
  scanner.codigo = producto.codigoBarras;
  scanner.buscarManual(submit);
  assert.equal(scanner.ocupado(), true);
  scanner.limpiar();
  pending.next(producto);
  assert.equal(scanner.producto(), null);
  assert.equal(scanner.codigo, '');
  assert.equal(scanner.ocupado(), false);
});

test('clear ignores a late photo decode and does not query the catalog', async () => {
  let finish;
  const reader = { validarArchivo() {}, leer: () => new Promise(resolve => { finish = resolve; }) };
  let queries = 0;
  const scanner = new Scanner(reader, { obtenerProductoPorCodigo: () => { queries++; return of(producto); } });
  const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
  const input = { files: [file], value: 'photo.jpg' };
  const decoding = scanner.seleccionarFoto({ target: input });
  scanner.limpiar();
  finish(producto.codigoBarras);
  await decoding;
  assert.equal(queries, 0);
  assert.equal(scanner.preview, '');
  assert.equal(input.value, '');
});

test('bad file types, empty images and files over 12 MB are rejected', () => {
  const reader = new Reader();
  for (const file of [
    new File(['pdf'], 'file.pdf', { type: 'application/pdf' }),
    new File(['heic'], 'file.heic', { type: 'image/heic' }),
    new File([], 'empty.png', { type: 'image/png' }),
    { type: 'image/jpeg', size: 12 * 1024 * 1024 + 1 }
  ]) assert.throws(() => reader.validarArchivo(file));
  assert.doesNotThrow(() => reader.validarArchivo(new File(['png'], 'file.png', { type: 'image/png' })));
});

test('destroying the panel cancels lookup subscriptions', () => {
  const pending = new Subject();
  const scanner = new Scanner({}, { obtenerProductoPorCodigo: () => pending });
  scanner.codigo = producto.codigoBarras;
  scanner.buscarManual(submit);
  scanner.ngOnDestroy();
  pending.next(producto);
  assert.equal(scanner.producto(), null);
  assert.equal(scanner.ocupadoCambio.values.at(-1), false);
});

test('warehouse selection includes products outside page 1, preserves batch fields and never saves stock', () => {
  const Compras = load('pages/compras/compras.component.ts', 'ComprasComponent');
  const compras = new Compras({}, {}, {}, {});
  compras.itemIngresoTemporal.numeroLote = 'LOTE-INSPECCIONADO';
  compras.itemIngresoTemporal.fechaVencimiento = '2028-01-01';
  compras.itemIngresoTemporal.cantidadRecibida = 7;
  compras.seleccionarProductoPorCodigo({ ...producto, precioCosto: 2.5 });
  assert.equal(compras.itemIngresoTemporal.productoId, 155);
  assert.equal(compras.itemIngresoTemporal.costoUnitarioReal, 2.5);
  assert.equal(compras.productos().length, 1);
  assert.equal(compras.ingresoForm.items.length, 0);
  assert.equal(compras.itemIngresoTemporal.numeroLote, 'LOTE-INSPECCIONADO');
  assert.equal(compras.itemIngresoTemporal.fechaVencimiento, '2028-01-01');
  assert.equal(compras.itemIngresoTemporal.cantidadRecibida, 7);
  compras.seleccionarProductoPorCodigo(producto);
  assert.equal(compras.productos().length, 1);
  assert.equal(compras.itemIngresoTemporal.costoUnitarioReal, 0);
  compras.seleccionarProductoPorCodigo(null);
  assert.equal(compras.itemIngresoTemporal.productoId, null);
});

test('automatic warehouse scan adds a pending row only with complete batch data, without saving stock', () => {
  const Compras = load('pages/compras/compras.component.ts', 'ComprasComponent');
  const compras = new Compras({}, {}, {}, {});
  compras.itemIngresoTemporal.numeroLote = '';
  compras.agregarProductoEscaneado(producto);
  assert.equal(compras.ingresoForm.items.length, 0);
  assert.equal(compras.itemIngresoTemporal.productoId, producto.id);
  assert.match(compras.avisoEscaneo(), /Completa/);
  Object.assign(compras.itemIngresoTemporal, {
    numeroLote: 'LOTE-REAL', fechaVencimiento: '2028-01-01', cantidadRecibida: 7, costoUnitarioReal: 2.5
  });
  compras.agregarProductoEscaneado(producto);
  assert.equal(compras.ingresoForm.items.length, 1);
  const row = compras.ingresoForm.items[0];
  assert.equal(row.numeroLote, 'LOTE-REAL');
  assert.equal(row.cantidadRecibida, 7);
  assert.equal(row.costoUnitarioReal, 2.5);
  assert.match(compras.avisoEscaneo(), /agregado automáticamente/);
});

test('product registration scanner emits barcode without querying or creating a catalog product', () => {
  const scanner = new Scanner({}, {});
  scanner.soloCodigo = true;
  scanner.codigo = '0012345678905';
  scanner.buscarManual(submit);
  assert.equal(scanner.codigoLeido.values.at(-1), '0012345678905');
  assert.equal(scanner.ocupado(), false);
  assert.equal(scanner.producto(), null);
});

test('new product defaults to unit and supports bottle, box and custom presentation without changing other fields', () => {
  const Productos = load('pages/productos/productos.component.ts', 'ProductosComponent');
  const productos = new Productos({}, {}, {});
  productos.abrirModalNuevo();
  assert.equal(productos.nuevoProductoForm.presentacion, 'Unidad');
  productos.nuevoProductoForm.codigoBarras = '0012345678905';
  productos.tipoPresentacion = 'Botella';
  productos.detallePresentacion = '400 ml';
  productos.actualizarPresentacion();
  assert.equal(productos.nuevoProductoForm.presentacion, 'Botella · 400 ml');
  productos.tipoPresentacion = 'Caja';
  productos.detallePresentacion = 'x 30 tabletas';
  productos.actualizarPresentacion();
  assert.equal(productos.nuevoProductoForm.presentacion, 'Caja · x 30 tabletas');
  productos.tipoPresentacion = 'Otra';
  productos.detallePresentacion = 'Pack de cuidado personal';
  productos.actualizarPresentacion();
  assert.equal(productos.nuevoProductoForm.presentacion, 'Pack de cuidado personal');
  assert.equal(productos.nuevoProductoForm.codigoBarras, '0012345678905');
  productos.abrirModalNuevo();
  assert.equal(productos.tipoPresentacion, 'Unidad');
  assert.equal(productos.detallePresentacion, '');
});
