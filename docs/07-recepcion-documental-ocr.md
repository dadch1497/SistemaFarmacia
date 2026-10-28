# Recepción asistida por lectura de documentos

## Uso

1. Iniciar sesión como administrador o almacenero. Abrir Recepción en Almacén y Registrar Ingreso; también se puede entrar desde Recepcionar en una orden aprobada.
2. Usar **Capturar guía** para encender la cámara y fotografiar la página, o **Subir foto** para seleccionar una imagen JPG, PNG o WebP de una página. También admite PDF de hasta 10 páginas, con texto o páginas escaneadas. Máximo 12 MB y 40 megapíxeles para imágenes; se reduce a 2800 píxeles para limitar memoria.
3. Revisar el número de guía/factura, el proveedor y el RUC del **emisor**. Un documento puede contener tanto el RUC del proveedor como el del cliente; la lectura no verifica su identidad fiscal.
4. Elegir la orden aprobada o en tránsito que corresponda. Las filas se vinculan automáticamente consultando todas las páginas del catálogo activo (hasta 10.000 productos). Se prioriza un código exacto y único; si el código del proveedor es diferente, se intenta una descripción normalizada exacta y única, incluyendo nombre más presentación. No se selecciona una coincidencia aproximada ni el primer producto de la lista. En otros casos, seleccionar el producto manualmente. La búsqueda consulta el catálogo completo, con hasta 30 resultados por búsqueda.
5. Verificar cada cantidad, presentación, costo **unitario**, lote y vencimiento contra el documento y la mercadería. Si una guía no tiene precios, usar el botón **Usar costo pactado** de la orden. La diferencia de precio puede deberse al tratamiento del IGV: no se convierte automáticamente ni se interpreta el importe de línea como costo unitario.
6. Revisar la comparación de cantidades, productos no solicitados, productos ausentes, costo y RUC. La cantidad de un producto se suma entre los lotes de este documento.
7. Marcar la revisión de diferencias, cuando corresponda, y la revisión de todas las filas. **Aplicar borrador revisado** reemplaza las filas actuales de la recepción. No acumula páginas ni duplica filas por un segundo clic. Para otra página, preparar otra recepción o incorporar manualmente sus filas al borrador antes de aplicar.
8. Revisar las filas finales y pulsar la acción existente **Confirmar Recepción y Actualizar Stock**. Se sigue usando el endpoint de recepción y su evento existente. Escanear, editar y aplicar el borrador no escriben productos, inventario ni órdenes.

## Qué reconoce y qué deja para revisión

- Extrae etiquetas explícitas de guía, factura, proveedor y RUC.
- Para filas, identifica columnas encabezadas de descripción/código, cantidad, costo, lote y vencimiento. Usa posiciones de palabras para reconstruir tablas a partir del OCR. También admite columnas separadas por `|`, tabulaciones o espacios múltiples al corregir el texto.
- No adivina tablas sin encabezado, estructuras con celdas fusionadas o descripciones en varias líneas. El texto e imagen originales permanecen disponibles y se pueden añadir filas manualmente.
- Las fechas incompletas (por ejemplo, solo mes/año), fechas imposibles y números ambiguos quedan pendientes. No transforma letras OCR en dígitos ni elimina ceros del código de barras.
- Los campos ausentes no se inventan. Se eliminaron los números aleatorios de guía, factura, lote y fechas futuras ficticias que el formulario generaba al recepcionar desde una orden. Las filas finales son editables para completar los datos reales.
- La confianza mostrada es una estimación del reconocimiento de texto del motor; no es una probabilidad de exactitud de cada campo ni una validación del documento.
- Se exige un producto vinculado, cantidad entera positiva, costo positivo, lote y fecha válida antes de aplicar. El usuario puede excluir una fila.

## Alcance actual

- Imágenes de una página o PDF de hasta 10 páginas; no comprobantes electrónicos XML. Capturar guía usa la cámara de PC o celular mediante getUserMedia (sin micrófono) en localhost o HTTPS. Se muestra una vista previa y el usuario pulsa Capturar y leer guía. Subir foto permite usar una imagen guardada.
- Máximo 150 filas por borrador. Fotografías inclinadas, desenfocadas, manuscritas, con reflejos o tablas complejas pueden requerir corrección manual.
- La comparación corresponde al documento actual frente a la orden completa. No administra saldos pendientes de entregas parciales, no descuenta recepciones anteriores y no añade un nuevo flujo de aprobación de diferencias. El backend actual conserva su tratamiento de estados de orden al registrar la recepción; este módulo no lo cambia.
- El PDF o imagen original se puede conservar como adjunto de la recepción y consultar, descargar o imprimir desde su detalle. La creación con adjunto se realiza mediante multipart en una transacción de base de datos. No representa validación SUNAT ni certificación fiscal.

## Implementación y privacidad

Tesseract.js 7 y el modelo español se sirven desde el propio frontend en `/ocr/`. El worker, núcleo WebAssembly y modelo no necesitan un CDN en tiempo de ejecución. La imagen se procesa en el navegador. Las URL de vista previa se liberan al reemplazar, descartar o cerrar; el worker se termina al acabar/cancelar y se ignoran resultados tardíos. Hay un límite de dos minutos por lectura.

Los recursos se copian desde `node_modules` mediante `angular.json`; se instalan reproduciblemente con `npm ci`. Las dependencias nuevas usan licencias Apache-2.0 (Tesseract) y MIT (paquete de idioma).

Referencias técnicas: [API oficial de Tesseract.js](https://github.com/naptha/tesseract.js/blob/master/docs/api.md), [recursos locales](https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md).

## Verificación

```sh
npm ci
npm run test:barcode
npm run test:documento
npm run build
```

Se cubren extracción, posiciones de tabla, decimales, fechas imposibles, importes que no son costos, campos faltantes, ceros iniciales, coincidencias ambiguas, productos inactivos, suma de lotes, diferencias, revisión obligatoria, cancelación, resultados tardíos y ausencia de escritura de stock al aplicar. En navegador se comprobó el OCR real con una imagen ficticia de dos productos (guía, factura, RUC, cantidades, costos, lotes y vencimientos). El guardado con datos reales requiere una sesión vigente y no forma parte de esa prueba ficticia.

Para evaluar el aporte en la tesis, usar documentos de varios formatos con datos anonimizados y transcripción verificada: medir tiempo de registro manual/asistido, exactitud por campo, filas no detectadas y número de correcciones. Separar documentos usados para ajustar el lector de los usados para evaluarlo. No presentar los resultados de la imagen de demostración como rendimiento general.

## Interfaz de recepción

La recepción se organiza en tres pasos visibles: foto, revisión y confirmación. El escáner individual de códigos de barras se retiró de esta pantalla; permanece disponible en Productos. La alternativa manual queda plegada y sin seleccionar el primer producto por defecto. Cada fila del documento muestra si está vinculada o requiere selección; los errores de sesión explican por qué no se pudo consultar el catálogo y permiten reintentar con Vincular productos.

## Archivo original de la guía

- Nueva recepción: Adjuntar guía permite conservar un PDF, JPG, PNG o WebP de hasta 12 MB, aunque no se utilice el lector. Leer PDF/foto también propone ese original como adjunto. Se envía al servidor al confirmar el ingreso, con los datos de la recepción.
- Recepciones guardadas: en Ver detalle se puede ver la guía, descargar los bytes originales o imprimir una representación visual. Si todavía no tiene adjunto, administrador y almacenero pueden añadirlo sin volver a registrar stock. No se permite reemplazar un documento ya guardado.
- Almacenamiento: migración V3 agrega guia_documento a db_compras, con clave de recepción y contenido MEDIUMBLOB. No depende del sistema de archivos del contenedor y conserva los respaldos de la base de datos. No se guardan blobs en listados de ingresos, solo el indicador de existencia.
- Seguridad: acceso autenticado exclusivo de administrador y almacenero. Se verifica tamaño y firma de tipo de archivo en servidor. Las descargas envían attachment, nosniff y no-store. El visor dibuja las páginas con PDF.js; no ejecuta scripts del PDF ni usa URLs públicas de documentos.
- Recursos PDF.js, fuentes y worker se sirven localmente. Se conserva la estructura de las guías SUNAT GRE con encabezados de tabla en varias líneas, descripción, unidad y cantidad. No se interpreta el peso bruto como cantidad ni se deduce costo/lote/vencimiento ausente.
- Imprimir abre el diálogo del navegador con las páginas renderizadas; Descargar original permite imprimir el PDF original en el lector de PDF del equipo. No se modifica el PDF original.
