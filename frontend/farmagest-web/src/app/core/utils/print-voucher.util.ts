/**
 * Utilidad para impresión de vouchers, tickets y comprobantes electrónicos SUNAT.
 * Configurado específicamente para impresoras térmicas de 58 mm (203 dpi):
 * - Papel: 58 mm de ancho
 * - Área imprimible: 48 mm de ancho (márgenes laterales de 5 mm)
 * - Márgenes superior e inferior: 2 mm
 * - Centro del papel: x = 29 mm
 * - Filas de productos: 4 mm de alto; 8 mm para texto en 2 líneas (8 pt ≈ 1 mm)
 * - Código QR de alta resolución con fallback SVG garantizado
 */

export const QR_FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="25" height="25" fill="black"/><rect x="15" y="15" width="15" height="15" fill="white"/><rect x="18" y="18" width="9" height="9" fill="black"/><rect x="65" y="10" width="25" height="25" fill="black"/><rect x="70" y="15" width="15" height="15" fill="white"/><rect x="73" y="18" width="9" height="9" fill="black"/><rect x="10" y="65" width="25" height="25" fill="black"/><rect x="15" y="70" width="15" height="15" fill="white"/><rect x="18" y="73" width="9" height="9" fill="black"/><rect x="42" y="12" width="16" height="6" fill="black"/><rect x="42" y="24" width="8" height="12" fill="black"/><rect x="56" y="28" width="6" height="8" fill="black"/><rect x="12" y="42" width="16" height="8" fill="black"/><rect x="34" y="42" width="8" height="8" fill="black"/><rect x="48" y="42" width="10" height="16" fill="black"/><rect x="64" y="42" width="12" height="6" fill="black"/><rect x="82" y="42" width="8" height="14" fill="black"/><rect x="24" y="56" width="18" height="6" fill="black"/><rect x="64" y="54" width="8" height="14" fill="black"/><rect x="78" y="62" width="12" height="8" fill="black"/><rect x="42" y="64" width="16" height="8" fill="black"/><rect x="42" y="78" width="8" height="12" fill="black"/><rect x="56" y="78" width="14" height="6" fill="black"/><rect x="76" y="76" width="14" height="14" fill="black"/><rect x="62" y="86" width="8" height="6" fill="black"/></svg>';

export function generarQrUrlSunat(raw: string | undefined, defaultData: string): string {
  if (raw && (raw.startsWith('data:image') || raw.includes('api.qrserver.com'))) {
    return raw;
  }
  const text = raw || defaultData;
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=2&data=${encodeURIComponent(text)}`;
}

export function imprimirElementoVoucher(elementoId: string, tituloDocumento: string = 'Comprobante_Termico'): void {
  const elem = document.getElementById(elementoId);
  if (!elem) {
    window.print();
    return;
  }

  // Crear un iframe invisible para renderizar e imprimir únicamente el comprobante
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position: fixed; width: 0; height: 0; left: -9999px; top: -9999px; border: 0;');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>${tituloDocumento}</title>
      <style>
        /* =========================================================
           MEDIDAS PARA IMPRESORA TÉRMICA DE 58 MM (203 DPI)
           Papel: 58 mm ancho (rollo continuo estándar POS-58)
           Área imprimible del cabezal físico: 48 mm (384 dots a 203 dpi)
           Ancho máximo de contenido útil: 47 mm (garantiza 0.5 mm de margen
           seguro a cada lado para evitar cualquier corte o desborde derecho)
           Márgenes físicos: 0 (el driver de Windows POS-58 mapea x=0 al cabezal)
           ========================================================= */
        @page {
          size: 58mm 297mm;
          margin: 0;
        }

        @media print {
          html, body {
            width: 48mm !important;
            max-width: 48mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
          }
        }

        * {
          box-sizing: border-box !important;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          width: 48mm !important;
          max-width: 48mm !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          font-size: 7pt !important;
          line-height: 1.2 !important;
          color: #000000 !important;
          background: #ffffff !important;
        }

        /* Contenedor principal del ticket (48 mm exactos del cabezal térmico) */
        .ticket-recibo,
        #seccion-nota-credito-imprimible,
        #seccion-nota-credito-pos-imprimible,
        #printSection {
          width: 48mm !important;
          max-width: 48mm !important;
          margin: 0 !important;
          padding: 1.5mm 0.5mm 1.5mm 0.5mm !important;
          box-sizing: border-box !important;
          border: none !important;
          box-shadow: none !important;
          background: #ffffff !important;
          color: #000000 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          overflow: hidden !important;
        }

        /* Encabezado y membrete de farmacia */
        h3, h4, h5, p, span, div, strong {
          color: #000000 !important;
        }

        .ticket-recibo h3 {
          font-size: 7.8pt !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          margin: 0 0 0.8mm 0 !important;
          text-align: center !important;
          letter-spacing: -0.1px !important;
          word-break: break-word !important;
        }

        .ticket-recibo p {
          font-size: 6.8pt !important;
          line-height: 1.15 !important;
          margin: 0 0 0.4mm 0 !important;
          text-align: center !important;
          word-break: break-word !important;
        }

        /* Caja de identificación del comprobante */
        div[style*="border: 1.5px solid"],
        div[style*="border: 2px solid"],
        div[style*="border: 1px solid"],
        .ticket-box-comprobante {
          border: 1px solid #000000 !important;
          border-radius: 2px !important;
          padding: 1mm 0.5mm !important;
          margin: 1.2mm 0 !important;
          background: #ffffff !important;
          text-align: center !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        div[style*="border: 1.5px solid"] h4,
        div[style*="border: 2px solid"] h4,
        div[style*="border: 1px solid"] h4,
        div[style*="border: 1.5px solid"] h5,
        div[style*="border: 2px solid"] h5,
        div[style*="border: 1px solid"] h5 {
          font-size: 6.8pt !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          margin: 0 !important;
          letter-spacing: -0.1px !important;
          white-space: nowrap !important;
        }

        div[style*="border: 1.5px solid"] h3,
        div[style*="border: 2px solid"] h3,
        div[style*="border: 1px solid"] h3 {
          font-size: 8.8pt !important;
          font-weight: 900 !important;
          margin: 0.4mm 0 0 0 !important;
          color: #000000 !important;
          text-align: center !important;
        }

        /* Insignia SUNAT */
        .badge-sunat-ok {
          display: inline-block !important;
          font-size: 6.5pt !important;
          font-weight: 700 !important;
          padding: 0.3mm 1.5mm !important;
          border: 1px solid #000000 !important;
          background: #ffffff !important;
          color: #000000 !important;
          border-radius: 2px !important;
          margin: 0.5mm auto !important;
        }

        /* Líneas divisorias térmicas */
        .ticket-divider,
        div[style*="border-bottom: 2px solid"],
        div[style*="border-bottom: 1px dashed"] {
          border-bottom: 1px dashed #000000 !important;
          margin: 1mm 0 !important;
          padding-bottom: 0.8mm !important;
        }

        /* Bloque de datos del documento y cliente */
        div[style*="line-height: 1.45"],
        .ticket-info-grid {
          font-size: 6.8pt !important;
          line-height: 1.2 !important;
          margin-bottom: 1mm !important;
          border-bottom: 1px dashed #000000 !important;
          padding-bottom: 1mm !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }

        /* Desplegar Fecha y Medio de Reembolso en renglones separados para que no compitan por el ancho */
        div[style*="line-height: 1.45"] div[style*="display: flex"] {
          display: block !important;
        }
        div[style*="line-height: 1.45"] div[style*="display: flex"] span {
          display: block !important;
          margin-bottom: 0.4mm !important;
        }

        /* Tabla de productos (Ancho total estricto: 47 mm para holgura de seguridad) */
        table,
        .ticket-recibo table,
        table.ticket-table {
          width: 47mm !important;
          max-width: 47mm !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          margin: 1mm 0 !important;
        }

        table thead tr,
        table tr[style*="border-bottom: 1px solid"] {
          border-top: 1px dashed #000000 !important;
          border-bottom: 1px dashed #000000 !important;
        }

        table th {
          font-size: 6.5pt !important;
          font-weight: 800 !important;
          padding: 0.6mm 0.2mm !important;
          text-transform: uppercase !important;
        }

        /* Filas de productos: 4 mm de alto; 8 mm si ocupa dos líneas */
        table tbody tr {
          min-height: 4mm !important;
          border-bottom: 1px dotted #999999 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        table td {
          font-size: 6.5pt !important;
          padding: 0.5mm 0.2mm !important;
          vertical-align: top !important;
          line-height: 1.15 !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }

        /* Distribución de columnas para ancho estricto de 47 mm (evita corte derecho) */
        /* Tabla con 5 columnas (Cant: 5.5mm, Descripción: 16mm, Lote: 8mm, P.Unit: 8mm, Total: 9.5mm = 47mm) */
        table th:nth-child(1):nth-last-child(5), table td:nth-child(1):nth-last-child(5) {
          width: 5.5mm !important;
          text-align: center !important;
        }
        table th:nth-child(2):nth-last-child(4), table td:nth-child(2):nth-last-child(4) {
          width: 16mm !important;
          text-align: left !important;
          padding-left: 0.8mm !important;
        }
        table th:nth-child(3):nth-last-child(3), table td:nth-child(3):nth-last-child(3) {
          width: 8mm !important;
          text-align: left !important;
          font-family: monospace !important;
        }
        table th:nth-child(4):nth-last-child(2), table td:nth-child(4):nth-last-child(2) {
          width: 8mm !important;
          text-align: right !important;
        }
        table th:nth-child(5):nth-last-child(1), table td:nth-child(5):nth-last-child(1) {
          width: 9.5mm !important;
          text-align: right !important;
        }

        /* Tabla con 4 columnas (Cant: 5mm, Descripción: 23mm, P.Unit: 8mm, Total: 11mm = 47mm) */
        table th:nth-child(1):nth-last-child(4), table td:nth-child(1):nth-last-child(4) {
          width: 5mm !important;
          text-align: center !important;
        }
        table th:nth-child(2):nth-last-child(3), table td:nth-child(2):nth-last-child(3) {
          width: 23mm !important;
          text-align: left !important;
        }
        table th:nth-child(3):nth-last-child(2), table td:nth-child(3):nth-last-child(2) {
          width: 8mm !important;
          text-align: right !important;
        }
        table th:nth-child(4):nth-last-child(1), table td:nth-child(4):nth-last-child(1) {
          width: 11mm !important;
          text-align: right !important;
        }

        /* Tabla con 3 columnas (Cant: 5mm, Descripción: 28mm, Total: 14mm = 47mm) */
        table th:nth-child(1):nth-last-child(3), table td:nth-child(1):nth-last-child(3) {
          width: 5mm !important;
          text-align: center !important;
        }
        table th:nth-child(2):nth-last-child(2), table td:nth-child(2):nth-last-child(2) {
          width: 28mm !important;
          text-align: left !important;
        }
        table th:nth-child(3):nth-last-child(1), table td:nth-child(3):nth-last-child(1) {
          width: 14mm !important;
          text-align: right !important;
        }

        /* Bloque de totales alineado (Ancho 47 mm) */
        div[style*="width: 220px"],
        div[style*="width: 200px"],
        div[style*="margin-left: auto"],
        .ticket-totales {
          width: 47mm !important;
          max-width: 47mm !important;
          margin: 1mm 0 !important;
          font-size: 7pt !important;
          line-height: 1.25 !important;
        }

        div[style*="TOTAL DEVUELTO"],
        div[style*="TOTAL:"],
        div[style*="IMPORTE TOTAL:"],
        .ticket-totales .fila-total,
        .ticket-gran-total {
          font-size: 8pt !important;
          font-weight: 900 !important;
          border-top: 1px solid #000000 !important;
          padding-top: 0.6mm !important;
          margin-top: 0.6mm !important;
        }

        /* Código QR SUNAT Centrado */
        div[style*="border-top: 1px dashed"],
        .ticket-sunat-qr {
          border-top: 1px dashed #000000 !important;
          margin-top: 1.2mm !important;
          padding-top: 1.2mm !important;
          text-align: center !important;
        }

        img,
        .ticket-recibo img {
          width: 26mm !important;
          height: 26mm !important;
          max-width: 26mm !important;
          max-height: 26mm !important;
          margin: 0 auto !important;
          display: block !important;
          border: none !important;
          image-rendering: pixelated !important;
        }

        div[style*="Hash CPE"],
        div[style*="font-family: monospace"] {
          font-family: monospace !important;
          font-size: 6pt !important;
          word-break: break-all !important;
          margin-top: 0.8mm !important;
          text-align: center !important;
        }

        div[style*="Representación Impresa"],
        div[style*="Autorizado mediante resolución"],
        .ticket-footer-text {
          font-size: 6.2pt !important;
          text-align: center !important;
          margin-top: 0.4mm !important;
          line-height: 1.15 !important;
        }
      </style>
    </head>
    <body>
      ${elem.innerHTML}
    </body>
    </html>
  `);
  doc.close();

  // Esperar a que las imágenes (especialmente el QR) carguen correctamente, o aplicar fallback
  const imgs = Array.from(doc.querySelectorAll('img'));
  const waitForImages = Promise.all(
    imgs.map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
          return;
        }
        img.onload = () => resolve();
        img.onerror = () => {
          img.src = QR_FALLBACK_SVG;
          resolve();
        };
        // Timeout de seguridad de 400ms para no bloquear la impresión
        setTimeout(() => {
          if (!img.complete || img.naturalWidth === 0) {
            img.src = QR_FALLBACK_SVG;
          }
          resolve();
        }, 400);
      });
    })
  );

  waitForImages.then(() => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Error al imprimir voucher mediante iframe:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 150);
  });
}
