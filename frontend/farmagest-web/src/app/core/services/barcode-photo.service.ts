import { Injectable } from '@angular/core';

/** Decodes locally: the image is never uploaded to an API. */
@Injectable({ providedIn: 'root' })
export class BarcodePhotoService {
  private async crearLector() {
    // Load on demand for a photo or a camera session.
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import('@zxing/browser'), import('@zxing/library')
      ]);
      const reader = new BrowserMultiFormatReader(new Map<import('@zxing/library').DecodeHintType, unknown>([
        [DecodeHintType.TRY_HARDER, true],
        [DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
          BarcodeFormat.ITF, BarcodeFormat.CODABAR
        ]]
      ]));
    return reader;
  }

  async iniciarVideo(video: HTMLVideoElement, onCodigo: (codigo: string) => void): Promise<{ stop(): void }> {
    const reader = await this.crearLector();
    return reader.decodeFromVideoElement(video, (result: any, _error: any, controls: any) => {
      if (!result) return;
      const codigo = result.getText().trim();
      if (!codigo || codigo.length > 128 || !/^[\x20-\x7E]+$/.test(codigo)) return;
      controls.stop();
      onCodigo(codigo);
    });
  }

  validarArchivo(file: File): void {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Usa una foto JPG, PNG o WebP. Si tu celular guarda HEIC, conviértela a JPG.');
    }
    if (!file.size || file.size > 12 * 1024 * 1024) {
      throw new Error('La foto debe tener contenido y pesar como máximo 12 MB.');
    }
  }

  async leer(file: File): Promise<string> {
    this.validarArchivo(file);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      try {
        await image.decode();
      } catch {
        throw new Error('No se pudo abrir la foto. Prueba con otra imagen JPG o PNG.');
      }
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40_000_000) {
        throw new Error('La imagen es demasiado grande o no es válida. Recorta la zona del código e inténtalo de nuevo.');
      }

      const reader = await this.crearLector();
      const scale = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      // Accommodate horizontal, vertical and upside-down photos.
      for (const angle of [0, 90, 180, 270]) {
        canvas.width = angle % 180 ? height : width;
        canvas.height = angle % 180 ? width : height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Este navegador no permite leer imágenes. Prueba otro navegador o escribe el código.');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(angle * Math.PI / 180);
        context.drawImage(image, -width / 2, -height / 2, width, height);
        try {
          const text = reader.decodeFromCanvas(canvas).getText().trim();
          if (text.length <= 128 && /^[\x20-\x7E]+$/.test(text)) return text;
        } catch {
          // Try the next orientation; do not guess digits on an unreadable photo.
        }
      }
      throw new Error('No se pudo leer un código de barras. Acerca el código, evita reflejos y deja visibles sus dos extremos. También puedes escribirlo abajo.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
