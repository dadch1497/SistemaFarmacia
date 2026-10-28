import { Injectable } from '@angular/core';
import { LineaDocumento } from '../models/recepcion-documento';

@Injectable({ providedIn: 'root' })
export class PdfDocumentoService {
  async abrir(file: Blob) {
    if (!file.size || file.size > 12 * 1024 * 1024) throw new Error('Adjunta un archivo de hasta 12 MB.');
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.min.mjs?v=6.4.299-1';
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()),
      standardFontDataUrl: '/pdf/standard_fonts/', cMapUrl: '/pdf/cmaps/', cMapPacked: true,
      wasmUrl: '/pdf/wasm/' });
    let documento;
    try { documento = await task.promise; }
    catch (err) { await task.destroy(); throw err; }
    if (documento.numPages > 10) { await documento.loadingTask.destroy(); throw new Error('Se admiten PDF de hasta 10 páginas.'); }
    return documento;
  }
  async imagenes(file: Blob): Promise<string[]> {
    const documento = await this.abrir(file);
    try {
      const imagenes: string[] = [];
      for (let i = 1; i <= documento.numPages; i++) {
        const page = await documento.getPage(i);
        const original = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(1.7, 2200 / Math.max(original.width, original.height)) });
        const canvas = document.createElement('canvas'); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, viewport }).promise;
        imagenes.push(canvas.toDataURL('image/png'));
        page.cleanup();
      }
      return imagenes;
    } finally { await documento.loadingTask.destroy(); }
  }
  async texto(file: Blob, signal: AbortSignal): Promise<{ texto: string; lineas: LineaDocumento[] }> {
    signal.throwIfAborted();
    const documento = await this.abrir(file);
    const cancelar = () => { void documento.loadingTask.destroy(); };
    signal.addEventListener('abort', cancelar, { once: true });
    try {
      const lineas: LineaDocumento[] = [];
      for (let i = 1; i <= documento.numPages; i++) {
        signal.throwIfAborted();
        const page = await documento.getPage(i);
        const content = await page.getTextContent();
        const grupos: { y: number; palabras: { texto: string; x: number }[] }[] = [];
        for (const item of content.items) {
          if (!('str' in item) || !item.str.trim()) continue;
          const y = item.transform[5];
          let grupo = grupos.find(g => Math.abs(g.y - y) < 3);
          if (!grupo) { grupo = { y, palabras: [] }; grupos.push(grupo); }
          grupo.palabras.push({ texto: item.str.trim(), x: item.transform[4] });
        }
        grupos.sort((a,b)=>b.y-a.y);
        const normal = (t:string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
        const encabezado = grupos.find(g => g.palabras.some(p=>normal(p.texto).includes('DESCRIPCION DETALLADA')) && g.palabras.some(p=>normal(p.texto)==='CANTIDAD'));
        const pie = grupos.find(g => g.palabras.some(p=>normal(p.texto).includes('UNIDAD DE MEDIDA DEL PESO')));
        const sunat = !!encabezado && !!pie && grupos.some(g=>g.palabras.some(p=>normal(p.texto).includes('BIENES POR TRANSPORTAR')));
        for (const grupo of grupos) {
          if (sunat && grupo.y <= encabezado!.y+15 && grupo.y > pie!.y+5) continue;
          grupo.palabras.sort((a, b) => a.x - b.x);
          lineas.push({ texto: grupo.palabras.map(p => p.texto).join(' '), palabras: grupo.palabras });
        }
        // SUNAT GRE: multi-line headings and centered labels need separate column boundaries.
        if (encabezado && pie && grupos.some(g=>g.palabras.some(p=>normal(p.texto).includes('BIENES POR TRANSPORTAR')))) {
          const descripcionX=encabezado.palabras.find(p=>normal(p.texto).includes('DESCRIPCION DETALLADA'))!.x;
          const cantidadX=encabezado.palabras.find(p=>normal(p.texto)==='CANTIDAD')!.x;
          const unidad=grupos.flatMap(g=>g.palabras).find(p=>normal(p.texto)==='UNIDAD DE');
          if (unidad) {
            lineas.push({texto:'Descripcion | Cantidad | Unidad'});
            for (const fila of grupos.filter(g=>g.y<encabezado.y-10 && g.y>pie.y+5)) {
              const cantidad=fila.palabras.filter(p=>p.x>=cantidadX-10).map(p=>p.texto).join('');
              const descripcion=fila.palabras.filter(p=>p.x>=descripcionX-110 && p.x<unidad.x-15).map(p=>p.texto).join(' ');
              const medida=fila.palabras.filter(p=>p.x>=unidad.x-15 && p.x<cantidadX-10).map(p=>p.texto).join(' ');
              if(descripcion && /^\d+(?:[.,]\d{1,2})?$/.test(cantidad))lineas.push({texto:`${descripcion} | ${cantidad} | ${medida}`});
            }
            lineas.push({texto:'TOTAL'});
          }
        }
        page.cleanup();
      }
      return { texto: lineas.map(l => l.texto).join('\n'), lineas };
    } finally { signal.removeEventListener('abort', cancelar); await documento.loadingTask.destroy(); }
  }
}
