/**
 * Utilidad para impresión de vouchers, tickets y comprobantes electrónicos SUNAT.
 * Garantiza impresión limpia en una sola hoja, sin barras de navegación, sidebar ni saltos de página partidos.
 */

export const QR_FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="25" height="25" fill="black"/><rect x="15" y="15" width="15" height="15" fill="white"/><rect x="18" y="18" width="9" height="9" fill="black"/><rect x="65" y="10" width="25" height="25" fill="black"/><rect x="70" y="15" width="15" height="15" fill="white"/><rect x="73" y="18" width="9" height="9" fill="black"/><rect x="10" y="65" width="25" height="25" fill="black"/><rect x="15" y="70" width="15" height="15" fill="white"/><rect x="18" y="73" width="9" height="9" fill="black"/><rect x="42" y="12" width="16" height="6" fill="black"/><rect x="42" y="24" width="8" height="12" fill="black"/><rect x="56" y="28" width="6" height="8" fill="black"/><rect x="12" y="42" width="16" height="8" fill="black"/><rect x="34" y="42" width="8" height="8" fill="black"/><rect x="48" y="42" width="10" height="16" fill="black"/><rect x="64" y="42" width="12" height="6" fill="black"/><rect x="82" y="42" width="8" height="14" fill="black"/><rect x="24" y="56" width="18" height="6" fill="black"/><rect x="64" y="54" width="8" height="14" fill="black"/><rect x="78" y="62" width="12" height="8" fill="black"/><rect x="42" y="64" width="16" height="8" fill="black"/><rect x="42" y="78" width="8" height="12" fill="black"/><rect x="56" y="78" width="14" height="6" fill="black"/><rect x="76" y="76" width="14" height="14" fill="black"/><rect x="62" y="86" width="8" height="6" fill="black"/></svg>';

export function generarQrUrlSunat(raw: string | undefined, defaultData: string): string {
  if (raw && (raw.startsWith('data:image') || raw.includes('api.qrserver.com'))) {
    return raw;
  }
  const text = raw || defaultData;
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=2&data=${encodeURIComponent(text)}`;
}

export function imprimirElementoVoucher(elementoId: string, tituloDocumento: string = 'Comprobante'): void {
  const elem = document.getElementById(elementoId);
  if (!elem) {
    window.print();
    return;
  }

  // Crear un iframe temporal invisible para imprimir exclusivamente el voucher sin el sidebar ni elementos del sistema
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
        @page {
          size: auto;
          margin: 6mm 10mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
        }
        body {
          background: #ffffff;
          padding: 0;
          margin: 0;
          display: flex;
          justify-content: center;
        }
        .ticket-recibo {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          padding: 16px 20px;
          border: 1.5px solid #0f172a !important;
          border-radius: 6px;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          background: #ffffff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .badge-sunat-ok {
          background-color: #E6F4EA;
          color: #137333;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      ${elem.innerHTML}
    </body>
    </html>
  `);
  doc.close();

  // Dar tiempo para renderizar tipografías e imágenes del ticket
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
      }, 1500);
    }
  }, 350);
}
