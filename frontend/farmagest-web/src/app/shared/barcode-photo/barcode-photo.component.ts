import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BarcodePhotoService } from '../../core/services/barcode-photo.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { Producto } from '../../core/models/catalogo.models';

@Component({
  selector: 'app-barcode-photo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './barcode-photo.component.html',
  styleUrl: './barcode-photo.component.css'
})
export class BarcodePhotoComponent implements OnDestroy {
  @Input() puedeRegistrar = false;
  @Input() soloCodigo = false;
  @Output() codigoLeido = new EventEmitter<string>();
  @Output() productoSeleccionado = new EventEmitter<Producto | null>();
  @Output() productoEscaneado = new EventEmitter<Producto>();
  @Output() ocupadoCambio = new EventEmitter<boolean>();
  ocupado = signal(false);
  mensaje = signal('');
  error = signal('');
  noEncontrado = signal(false);
  producto = signal<Producto | null>(null);
  codigo = '';
  preview = '';
  nombreFoto = '';
  @ViewChild('videoCamara', { static: true }) videoCamara?: ElementRef<HTMLVideoElement>;
  camaraAbierta = signal(false);
  camaraLista = signal(false);
  camaras = signal<MediaDeviceInfo[]>([]);
  camaraId = '';
  private stream?: MediaStream;
  private lecturaVideo?: { stop(): void };
  private revisionCamara = 0;
  private revision = 0;
  private destruido = false;
  private consulta?: Subscription;

  constructor(private lector: BarcodePhotoService, private catalogo: CatalogoService) {}

  async seleccionarFoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // Allow retrying the very same photo.
    if (!file || this.ocupado()) return;
    await this.procesarFoto(file);
  }

  private async procesarFoto(file: File): Promise<void> {
    const revision = this.iniciar();
    this.codigo = '';
    this.quitarPreview();
    try {
      this.lector.validarArchivo(file);
      this.preview = URL.createObjectURL(file);
      this.nombreFoto = file.name;
      this.mensaje.set('Leyendo el código de la foto…');
      const codigo = await this.lector.leer(file);
      if (this.destruido || revision !== this.revision) return;
      this.codigo = codigo;
      this.consultar(codigo, revision);
    } catch (err) {
      if (this.destruido || revision !== this.revision) return;
      this.error.set(err instanceof Error ? err.message : 'No se pudo procesar la foto. Vuelve a intentarlo.');
      this.mensaje.set('');
      this.terminar();
    }
  }

  async abrirCamara(deviceId?: string): Promise<void> {
    if (this.ocupado() || this.destruido) return;
    this.error.set('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      this.error.set('La cámara necesita HTTPS o localhost. Abre el sistema en http://localhost:4250 en esta PC, o usa Subir foto.');
      return;
    }
    this.iniciar();
    this.codigo = '';
    this.quitarPreview();
    this.camaraAbierta.set(true);
    this.camaraLista.set(false);
    this.mensaje.set('Solicitando acceso a la cámara. Permite el acceso cuando lo pida el navegador.');
    const revision = ++this.revisionCamara;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: deviceId ? { deviceId: { exact: deviceId } } : {
          facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 }
        }
      });
      if (this.destruido || revision !== this.revisionCamara) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      this.stream = stream;
      const video = this.videoCamara?.nativeElement;
      if (!video) throw new Error('No se pudo mostrar la vista de la cámara.');
      video.srcObject = stream;
      await video.play();
      if (this.destruido || revision !== this.revisionCamara) return;
      this.camaraLista.set(true);
      this.camaraId = stream.getVideoTracks()[0]?.getSettings().deviceId || deviceId || '';
      this.mensaje.set('Acerca el código de barras. Se reconocerá y buscará automáticamente, sin capturar una foto.');
      const controls = await this.lector.iniciarVideo(video, codigo => {
        if (this.destruido || revision !== this.revisionCamara || !this.camaraLista()) return;
        this.camaraLista.set(false);
        this.cerrarCamara();
        this.codigo = codigo;
        this.consultar(codigo, this.iniciar(), true);
      });
      if (this.destruido || revision !== this.revisionCamara) { controls.stop(); return; }
      this.lecturaVideo = controls;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!this.destruido && revision === this.revisionCamara) {
          this.camaras.set(devices.filter(device => device.kind === 'videoinput'));
        }
      } catch { /* Preview still works if device enumeration is unavailable. */ }
    } catch (err) {
      if (this.destruido || revision !== this.revisionCamara) return;
      this.cerrarCamara();
      const name = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
      this.error.set(name === 'NotAllowedError' || name === 'SecurityError'
        ? 'El permiso de cámara fue rechazado. Permite la cámara en los permisos de este sitio y vuelve a pulsar Escanear con cámara.'
        : name === 'NotFoundError' || name === 'OverconstrainedError'
        ? 'No se encontró esa cámara. Comprueba que esté conectada y vuelve a intentarlo.'
        : name === 'NotReadableError' || name === 'AbortError'
        ? 'No se pudo encender la cámara. Cierra otras aplicaciones que la usen y revisa los permisos de cámara de Windows.'
        : 'No se pudo abrir la cámara. Revisa su conexión y permisos, o usa Subir foto.');
    }
  }

  cambiarCamara(): void {
    const id = this.camaraId;
    this.cerrarCamara();
    void this.abrirCamara(id);
  }

  cerrarCamara(): void {
    this.revisionCamara++;
    this.lecturaVideo?.stop();
    this.lecturaVideo = undefined;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = undefined;
    const video = this.videoCamara?.nativeElement;
    if (video) { video.pause(); video.srcObject = null; }
    this.camaraAbierta.set(false);
    this.camaraLista.set(false);
    this.mensaje.set('');
    this.terminar();
  }

  buscarManual(event: Event): void {
    event.preventDefault();
    if (this.ocupado()) return;
    const revision = this.iniciar();
    const codigo = this.codigo.trim();
    this.codigo = codigo; // Keep leading zeroes: a barcode is text, not a number.
    if (!codigo || codigo.length > 128 || !/^[\x20-\x7E]+$/.test(codigo)) {
      this.error.set('Escribe un código de barras válido de hasta 128 caracteres.');
      this.terminar();
      return;
    }
    this.quitarPreview();
    this.consultar(codigo, revision);
  }

  private iniciar(): number {
    this.consulta?.unsubscribe();
    this.revision++;
    this.ocupado.set(true);
    this.ocupadoCambio.emit(true);
    this.error.set('');
    this.mensaje.set('');
    this.noEncontrado.set(false);
    this.producto.set(null);
    this.productoSeleccionado.emit(null);
    return this.revision;
  }

  private consultar(codigo: string, revision: number, automatico = false): void {
    if (this.soloCodigo) {
      this.terminar();
      this.codigoLeido.emit(codigo);
      this.mensaje.set('Código completado. Revisa los datos y guarda el producto cuando estén completos.');
      return;
    }
    this.mensaje.set('Buscando el producto en el catálogo…');
    this.consulta = this.catalogo.obtenerProductoPorCodigo(codigo).subscribe({
      next: producto => {
        if (this.destruido || revision !== this.revision) return;
        this.mensaje.set('');
        if (!producto.activo) {
          this.error.set('Este producto está inactivo. Un administrador debe revisar su estado antes de recibirlo.');
        } else {
          this.producto.set(producto);
          if (!automatico) this.productoSeleccionado.emit(producto);
          this.mensaje.set(automatico ? 'Código reconocido automáticamente. Revisa el resultado en los ítems de recepción.' : 'Producto seleccionado. Completa el lote, vencimiento, cantidad y costo antes de agregarlo.');
        }
        this.terminar();
        if (automatico && producto.activo) this.productoEscaneado.emit(producto);
      },
      error: err => {
        if (this.destruido || revision !== this.revision) return;
        this.mensaje.set('');
        if (err.status === 404) {
          this.noEncontrado.set(true);
          this.error.set('El código no está registrado en el catálogo. Revisa el número o registra el producto antes de recibirlo.');
        } else if (err.status === 401 || err.status === 403) {
          this.error.set('Tu sesión venció o no tiene permiso para consultar el catálogo. Vuelve a iniciar sesión con un rol autorizado.');
        } else {
          this.error.set('No se pudo consultar el catálogo. Revisa la conexión y vuelve a buscar; esto no significa que el producto no exista.');
        }
        this.terminar();
      }
    });
  }

  limpiar(): void {
    this.cerrarCamara();
    this.revision++;
    this.consulta?.unsubscribe();
    this.codigo = '';
    this.producto.set(null);
    this.productoSeleccionado.emit(null);
    this.error.set('');
    this.mensaje.set('');
    this.noEncontrado.set(false);
    this.quitarPreview();
    this.terminar();
  }

  private terminar(): void {
    this.ocupado.set(false);
    this.ocupadoCambio.emit(false);
  }

  private quitarPreview(): void {
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.preview = '';
    this.nombreFoto = '';
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.cerrarCamara();
    this.revision++;
    this.consulta?.unsubscribe();
    this.quitarPreview();
    this.ocupadoCambio.emit(false);
  }
}
