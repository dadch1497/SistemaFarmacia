import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuiaAdjuntaComponent } from '../guia-adjunta/guia-adjunta.component';
import { Subscription, firstValueFrom, Subject, takeUntil, timeout } from 'rxjs';
import { OrdenCompra } from '../../core/models/compras.models';
import { DocumentoOcrService } from '../../core/services/documento-ocr.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { analizarDocumento, compararDocumento, DocumentoRecepcion, erroresFila, FilaDocumento, filaVacia, ProductoDocumento, RecepcionPreparada, vincularFilas } from '../../core/models/recepcion-documento';

@Component({
  selector: 'app-recepcion-documento', standalone: true, imports: [CommonModule, FormsModule, GuiaAdjuntaComponent],
  templateUrl: './recepcion-documento.component.html', styleUrl: './recepcion-documento.component.css'
})
export class RecepcionDocumentoComponent implements OnDestroy {
  @Input() productos: ProductoDocumento[] = [];
  @Input() ordenes: OrdenCompra[] = [];
  @Input() ordenId: number | null = null;
  archivoOriginal: File | null = null;
  @Output() archivoElegido = new EventEmitter<File | null>();
  @Output() preparado = new EventEmitter<RecepcionPreparada>();
  @Output() pendienteCambio = new EventEmitter<boolean>();
  abierto = true;
  vinculando = signal(false);
  catalogoCompleto = false;
  private cancelarVinculo = new Subject<void>();
  private revisionVinculo = 0;
  camaraAbierta = signal(false);
  camaraLista = signal(false);
  @ViewChild('videoDocumento', { static: true }) videoDocumento?: ElementRef<HTMLVideoElement>;
  private stream?: MediaStream;
  private revisionCamara = 0;
  leyendo = signal(false);
  progreso = signal(0);
  error = signal('');
  aviso = signal('');
  nombreArchivo = '';
  preview = '';
  texto = '';
  confianza: number | null = null;
  documento: DocumentoRecepcion | null = null;
  revisado = false;
  diferenciasRevisadas = false;
  aplicado = false;
  consultaProducto = '';
  buscando = signal(false);
  private extras: ProductoDocumento[] = [];
  private controlador?: AbortController;
  private revision = 0;
  private consulta?: Subscription;
  private destruido = false;

  constructor(private ocr: DocumentoOcrService, private catalogo: CatalogoService) {}

  ordenActual(): OrdenCompra | null { return this.ordenes.find(o => o.id === Number(this.ordenId)) ?? null; }
  opciones(): ProductoDocumento[] {
    const opciones = [...this.productos.filter(p => p.activo !== false), ...this.extras];
    for (const d of this.ordenActual()?.detalles ?? []) {
      if (!opciones.some(p => p.id === d.productoId)) opciones.push({ id: d.productoId, nombre: d.nombreProducto || `Producto #${d.productoId}` });
    }
    return [...new Map(opciones.map(p => [p.id, p])).values()];
  }
  diferencias(): string[] { return this.documento ? compararDocumento(this.documento, this.ordenActual()) : []; }
  errores(fila: FilaDocumento): string[] { return erroresFila(fila); }
  puedeAplicar(): boolean {
    const filas = this.documento?.filas.filter(f => f.incluir) ?? [];
    return !this.leyendo() && !this.vinculando() && !this.camaraAbierta() && !this.aplicado && this.revisado && filas.length > 0 &&
      filas.every(f => erroresFila(f).length === 0 && this.opciones().some(p => p.id === f.productoId)) &&
      (!this.diferencias().length || this.diferenciasRevisadas);
  }
  editar(): void { this.revisado = false; this.diferenciasRevisadas = false; this.aplicado = false; this.pendienteCambio.emit(true); }

  async abrirCamara(): Promise<void> {
    if (this.leyendo() || this.camaraAbierta() || this.destruido) return;
    this.error.set('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      this.error.set('La cámara requiere HTTPS o localhost. También puedes subir una foto guardada.'); return;
    }
    this.camaraAbierta.set(true);
    const revision = ++this.revisionCamara;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1920 } } });
      if (this.destruido || revision !== this.revisionCamara) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream;
      const video = this.videoDocumento?.nativeElement;
      if (!video) throw new Error('Vista de cámara no disponible');
      video.srcObject = stream; await video.play();
      if (revision === this.revisionCamara) this.camaraLista.set(true);
    } catch (err) {
      if (this.destruido || revision !== this.revisionCamara) return;
      this.cerrarCamara();
      this.error.set((err as { name?: string }).name === 'NotAllowedError'
        ? 'Permite el acceso a la cámara en el navegador o sube una foto guardada.'
        : 'No se pudo abrir la cámara. Verifica que esté conectada y libre, o sube una foto.');
    }
  }
  cerrarCamara(): void {
    this.revisionCamara++; this.stream?.getTracks().forEach(t => t.stop()); this.stream = undefined;
    const video = this.videoDocumento?.nativeElement;
    if (video) { video.pause(); video.srcObject = null; }
    this.camaraAbierta.set(false); this.camaraLista.set(false);
  }
  async capturar(): Promise<void> {
    const video = this.videoDocumento?.nativeElement;
    if (!this.camaraLista() || !video?.videoWidth || this.leyendo()) return;
    const revision = this.revisionCamara;
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext('2d'); if (!context) return;
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    if (this.destruido || revision !== this.revisionCamara) return;
    this.cerrarCamara();
    if (!blob) { this.error.set('No se pudo capturar la imagen. Inténtalo otra vez.'); return; }
    await this.procesar(new File([blob], 'guia-camara.jpg', { type: 'image/jpeg' }));
  }

  async seleccionar(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file || this.leyendo()) return;
    await this.procesar(file);
  }

  async procesar(file: File): Promise<void> {
    if (this.leyendo() || this.destruido) return;
    try { this.ocr.validar(file); } catch (err) { this.error.set((err as Error).message); return; }
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.archivoOriginal = file; this.archivoElegido.emit(file);
    this.preview = file.type === 'application/pdf' ? '' : URL.createObjectURL(file);
    this.nombreArchivo = file.name;
    this.cancelarVinculo.next(); this.revisionVinculo++; this.vinculando.set(false);
    this.texto = ''; this.documento = null; this.confianza = null;
    this.error.set(''); this.aviso.set(''); this.editar();
    this.progreso.set(0); this.leyendo.set(true);
    const revision = ++this.revision;
    const controller = new AbortController(); this.controlador = controller;
    controller.signal.addEventListener('abort', () => this.cancelarVinculo.next(), { once: true });
    const timeout = setTimeout(() => controller.abort(), 120_000);
    try {
      const resultado = await this.ocr.leer(file, controller.signal, p => this.progreso.set(p));
      if (this.destruido || revision !== this.revision) return;
      this.texto = resultado.texto;
      this.confianza = Math.round(resultado.confianza);
      this.documento = analizarDocumento(this.texto, resultado.lineas);
      await this.vincularCatalogo();
      if (this.destruido || revision !== this.revision) return;
      controller.signal.throwIfAborted();
      if (!this.texto.trim()) this.aviso.set('No se reconoció texto. Prueba una foto más nítida y bien iluminada.');
      else if (!this.documento.filas.length) this.aviso.set('Se leyó texto, pero no se identificó una tabla de productos. Revisa el texto y agrega las filas manualmente.');
    } catch (err) {
      if (this.destruido || revision !== this.revision) return;
      if (!controller.signal.aborted) console.warn('Fallo del motor OCR:', err instanceof Error ? err.message : String(err));
      this.error.set(controller.signal.aborted ? 'La lectura excedió dos minutos. Recorta el documento y vuelve a intentarlo.'
        : 'No se pudo leer la imagen. Usa una foto nítida del documento completo o registra los datos manualmente.');
    } finally {
      clearTimeout(timeout);
      if (revision === this.revision) this.leyendo.set(false);
    }
  }
  cancelarLectura(): void {
    this.revision++; this.controlador?.abort(); this.leyendo.set(false);
    this.cancelarVinculo.next(); this.revisionVinculo++; this.vinculando.set(false);
    this.aviso.set('Lectura cancelada. Puedes elegir otra imagen o descartar el documento.');
  }
  reanalizar(): void {
    this.documento = analizarDocumento(this.texto); this.editar(); void this.vincularCatalogo();
    this.aviso.set(this.documento.filas.length ? 'Se regeneró el borrador desde el texto. Revisa todas las filas.' : 'Tabla no identificada. Puedes añadir las filas manualmente.');
  }
  vincular(): void { if (this.documento) vincularFilas(this.documento.filas, this.opciones()); }
  vinculados(): number { return this.documento?.filas.filter(f => f.incluir && f.productoId).length ?? 0; }
  porRevisar(): number { return this.documento?.filas.filter(f => f.incluir && erroresFila(f).length > 0).length ?? 0; }
  async vincularCatalogo(): Promise<void> {
    if (!this.documento || this.destruido) return;
    this.cancelarVinculo.next();
    const revision = ++this.revisionVinculo;
    this.vinculando.set(true); this.error.set('');
    const filas = this.documento.filas;
    try {
      const encontrados: ProductoDocumento[] = [];
      for (let page = 0; page < 50; page++) {
        const respuesta = await firstValueFrom(this.catalogo.listarProductos(page, 200, undefined, undefined, true)
          .pipe(takeUntil(this.cancelarVinculo), timeout(15_000)));
        if (this.destruido || revision !== this.revisionVinculo) return;
        encontrados.push(...respuesta.content.filter(p => p.activo));
        if (page + 1 >= respuesta.totalPages) {
          this.extras = encontrados;
          this.catalogoCompleto = true;
          // Keep explicit manual choices; only resolve still-unlinked rows.
          vincularFilas(filas.filter(f => f.productoId === null), this.opciones());
          this.aviso.set(`${this.vinculados()} de ${filas.filter(f => f.incluir).length} productos vinculados. Revisa los que quedaron sin coincidencia.`);
          return;
        }
      }
      this.error.set('El catálogo supera el límite de búsqueda automática. Usa la búsqueda manual para vincular los productos.');
    } catch (err) {
      if (this.destruido || revision !== this.revisionVinculo) return;
      const status = (err as { status?: number }).status;
      this.error.set(status === 401 || status === 403
        ? 'La foto se leyó, pero tu sesión no permite consultar el catálogo. Inicia sesión de nuevo y pulsa Vincular productos.'
        : 'La foto se leyó, pero no se pudo consultar el catálogo. Revisa la conexión y pulsa Vincular productos.');
    } finally {
      if (revision === this.revisionVinculo) this.vinculando.set(false);
    }
  }
  cambiarOrden(): void { this.editar(); this.vincular(); }
  agregarFila(): void {
    this.documento ??= analizarDocumento('');
    if (this.documento.filas.length >= 150) { this.error.set('Máximo 150 filas por documento. Divide la recepción.'); return; }
    this.documento.filas.push(filaVacia()); this.editar();
  }
  costoOrden(fila: FilaDocumento): number | null {
    const costos = [...new Set(this.ordenActual()?.detalles.filter(d => d.productoId === fila.productoId).map(d => d.costoPactado) ?? [])];
    return costos.length === 1 ? costos[0] : null;
  }
  usarCosto(fila: FilaDocumento): void { fila.costo = this.costoOrden(fila); this.editar(); }
  buscarProductos(): void {
    const query = this.consultaProducto.trim();
    if (!query || this.buscando()) return;
    this.error.set(''); this.buscando.set(true);
    this.consulta = this.catalogo.listarProductos(0, 30, query).subscribe({
      next: respuesta => {
        this.extras = [...new Map([...this.extras, ...respuesta.content.filter(p => p.activo)].map(p => [p.id, p])).values()];
        this.aviso.set(respuesta.content.length ? 'Resultados disponibles en el selector de producto de cada fila (máximo 30 por búsqueda).' : 'Sin coincidencias. El producto debe estar registrado y activo.');
        this.buscando.set(false);
      },
      error: () => { this.buscando.set(false); this.error.set('No se pudo consultar el catálogo. Revisa tu sesión y conexión.'); }
    });
  }
  aplicar(): void {
    if (!this.documento || !this.puedeAplicar()) return;
    const documento = { ...this.documento, filas: this.documento.filas.filter(f => f.incluir).map(f => ({ ...f })) };
    this.preparado.emit({ documento, archivo: this.archivoOriginal ?? undefined, ordenId: this.ordenId ? Number(this.ordenId) : null, productos: this.opciones(), diferencias: this.diferencias() });
    this.aplicado = true; this.pendienteCambio.emit(false);
    this.aviso.set('Borrador aplicado a la recepción. Comprueba las filas y confirma el ingreso al terminar.');
  }
  descartar(): void {
    this.cancelarLectura(); this.cerrarCamara();
    this.cancelarVinculo.next(); this.revisionVinculo++; this.vinculando.set(false);
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.archivoOriginal = null; this.archivoElegido.emit(null);
    this.preview = ''; this.nombreArchivo = ''; this.texto = ''; this.documento = null;
    this.confianza = null; this.revisado = false; this.aplicado = false; this.diferenciasRevisadas = false;
    this.error.set(''); this.aviso.set(''); this.pendienteCambio.emit(false);
  }
  ngOnDestroy(): void {
    this.cerrarCamara(); this.cancelarVinculo.next(); this.cancelarVinculo.complete(); this.revisionVinculo++;
    this.destruido = true; this.revision++; this.controlador?.abort(); this.consulta?.unsubscribe();
    if (this.preview) URL.revokeObjectURL(this.preview);
  }
}
