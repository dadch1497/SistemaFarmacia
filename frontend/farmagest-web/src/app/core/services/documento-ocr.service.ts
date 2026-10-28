import { Injectable } from '@angular/core';
import { PdfDocumentoService } from './pdf-documento.service';
import { LineaDocumento } from '../models/recepcion-documento';

function interrumpible<T>(operacion: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const cancelar = () => reject(new DOMException('Lectura cancelada', 'AbortError'));
    signal.addEventListener('abort', cancelar, { once: true });
    if (signal.aborted) cancelar();
    operacion.then(resolve, reject).finally(() => signal.removeEventListener('abort', cancelar));
  });
}

@Injectable({ providedIn: 'root' })
export class DocumentoOcrService {
  constructor(private pdf: PdfDocumentoService) {}
  validar(file: File): void {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      throw new Error('Adjunta un PDF, JPG, PNG o WebP de hasta 12 MB.');
    if (!file.size || file.size > 12 * 1024 * 1024)
      throw new Error('La imagen debe tener contenido y pesar como máximo 12 MB.');
  }

  async leer(file: File, signal: AbortSignal, progreso: (valor: number) => void): Promise<{ texto: string; confianza: number; lineas: LineaDocumento[] }> {
    this.validar(file);
    signal.throwIfAborted();
    if (file.type === 'application/pdf') {
      const nativo = await this.pdf.texto(file, signal);
      if (nativo.texto.trim().length > 40) return { ...nativo, confianza: 100 };
      const paginas = await this.pdf.imagenes(file);
      const resultados: { texto: string; confianza: number; lineas: LineaDocumento[] }[] = [];
      for (const pagina of paginas) {
        signal.throwIfAborted(); const blob = await (await fetch(pagina)).blob();
        resultados.push(await this.leer(new File([blob], 'pagina.png', { type: 'image/png' }), signal, progreso));
      }
      return { texto: resultados.map(r => r.texto).join('\n'), confianza: resultados.reduce((s,r) => s+r.confianza,0)/resultados.length, lineas: resultados.flatMap(r=>r.lineas) };
    }
    const url = URL.createObjectURL(file);
    let worker: import('tesseract.js').Worker | undefined;
    const cancelar = () => { void worker?.terminate(); };
    signal.addEventListener('abort', cancelar, { once: true });
    try {
      const image = new Image();
      image.src = url;
      await interrumpible(image.decode(), signal);
      signal.throwIfAborted();
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40_000_000)
        throw new Error('La imagen supera 40 megapíxeles o no es válida. Recorta el documento.');
      const scale = Math.min(1, 2800 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No se pudo preparar la imagen. Prueba otro navegador.');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const { default: tesseract } = await import('tesseract.js');
      signal.throwIfAborted();
      worker = await interrumpible(tesseract.createWorker('spa', 1, {
        workerPath: '/ocr/worker.min.js', corePath: '/ocr/core', langPath: '/ocr/lang',
        workerBlobURL: false, errorHandler: () => {},
        logger: m => { if (!signal.aborted && m.status === 'recognizing text') progreso(Math.round(m.progress * 100)); }
      }).then(iniciado => {
        if (signal.aborted) void iniciado.terminate();
        return iniciado;
      }), signal);
      signal.throwIfAborted();
      await interrumpible(worker!.setParameters({ preserve_interword_spaces: '1' }), signal);
      const { data } = await interrumpible(worker!.recognize(canvas, {}, { text: true, blocks: true }), signal);
      signal.throwIfAborted();
      // Tesseract may split a table row into different blocks. Rebuild lines by their vertical centers.
      const words = (data.blocks ?? []).flatMap(b => b.paragraphs.flatMap(p => p.lines.flatMap(l => l.words)));
      const grupos: { y: number; alto: number; palabras: typeof words }[] = [];
      for (const palabra of words.sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0)) {
        const y = (palabra.bbox.y0 + palabra.bbox.y1) / 2;
        const alto = palabra.bbox.y1 - palabra.bbox.y0;
        const grupo = grupos.find(g => Math.abs(g.y - y) <= Math.max(5, Math.min(g.alto, alto) * 0.5));
        if (grupo) grupo.palabras.push(palabra);
        else grupos.push({ y, alto, palabras: [palabra] });
      }
      return { texto: data.text, confianza: data.confidence, lineas: grupos.sort((a, b) => a.y - b.y).map(g => {
        const palabras = g.palabras.sort((a, b) => a.bbox.x0 - b.bbox.x0).map(w => ({ texto: w.text, x: w.bbox.x0 }));
        return { texto: palabras.map(w => w.texto).join(' '), palabras };
      }) };
    } finally {
      signal.removeEventListener('abort', cancelar);
      if (!signal.aborted) await worker?.terminate();
      else if (worker) await worker.terminate();
      URL.revokeObjectURL(url);
    }
  }
}
