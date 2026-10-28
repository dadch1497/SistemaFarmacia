# Guía interna generada desde compras

## Flujo

1. El administrador registra la orden de compra. Mientras está PENDIENTE, no se genera la guía de cotejo.
2. Al aprobarla queda habilitado el bloque Guía de recepción en Ver detalle de la compra, para administrador y almacenero.
3. Ver guía genera el PDF y lo muestra. Descargar PDF permite guardarlo, y Preparar impresión muestra las páginas para luego imprimir. No hay que subir ni adjuntar archivos.
4. Recepcionar desde la orden muestra la misma guía esperada junto al registro del ingreso. El almacenero coteja productos, presentación, cantidades y costo, y completa los datos reales de recepción.
5. En Ver Lotes Recibidos se muestra la guía de la compra asociada. Si el ingreso antiguo no tiene compra vinculada, se genera una constancia con sus cantidades y lotes reales, sin inventar proveedor o compra.

## Documento

PDF A4 con cabecera FarmaGest, identificador GI- seguido del número de orden, proveedor/RUC/dirección registrados, fecha de la compra, sucursal, estado, productos/códigos/presentaciones, cantidades pedidas, costo pactado y espacios para cantidades físicas, lotes, vencimientos, diferencias y firmas. Contempla tablas de varias páginas con encabezado y numeración. Muestra los importes guardados de la compra; no recalcula el tratamiento tributario.

Es una hoja de control interno, no una guía de remisión SUNAT ni acreditación de entrega. El formato se inspira en una guía, pero no inventa datos fiscales, direcciones, transportistas ni documentos del proveedor.

## Generación y permisos

El PDF se genera a demanda a partir de la compra/ingreso persistido, consultado mediante los endpoints autenticados existentes, y de las fichas exactas de producto por ID (incluye productos fuera de la primera página del catálogo). No se crea una segunda compra ni se altera inventario. El PDF no es un archivo fiscal ni una instantánea histórica inmutable: se vuelve a generar desde los datos guardados al solicitarlo.

La interfaz de consulta reemplaza el bloque Adjuntar guía por Ver guía / Descargar PDF / Preparar impresión. El lector OCR externo se conserva como herramienta opcional, sin exigir adjuntar una guía al confirmar el ingreso. No se borran archivos externos que pudieran existir en base de datos.

Validación: npm run test:guia, test:documento, test:barcode y npm run build. Se revisó visualmente un PDF de demostración con tres productos y otro de 60 filas para comprobar la paginación, firmas y ausencia de recortes.
