# Recepción en Almacén: código de barras desde una foto

## Uso

1. Iniciar sesión como administrador o almacenero.
2. Ir a **Ingreso mercadería / Recepción en Almacén** y abrir **Registrar Ingreso de Mercadería**.
3. Elegir **Escanear con cámara** para encender la cámara de la PC o del celular. Permitir el acceso en el navegador y acercar el código a la vista previa; se reconoce automáticamente, sin capturar una foto. Si hay varias cámaras, se puede seleccionar otra. **Subir foto** sigue disponible para imágenes guardadas.
4. Usar una foto nítida con un solo código completo, sin reflejos. Se admiten JPG, PNG y WebP de hasta 12 MB y 40 megapíxeles. No se admite HEIC.
5. El lector completa el código y consulta el producto mediante el endpoint existente del catálogo. También se puede escribir o corregir el número y pulsar **Buscar producto**. Los ceros iniciales se conservan.
6. Si el producto está activo, se selecciona en el formulario, incluso si no estaba entre los primeros 100 productos cargados.
7. Con cámara, si lote, vencimiento, cantidad y costo están completos, se agrega una fila automáticamente. Si faltan datos, se selecciona el producto y se indica qué completar. La cámara se cierra al reconocer un código para evitar duplicados. Con foto o búsqueda manual, usar + Agregar. Confirmar la recepción para actualizar el stock.

## Productos no registrados

El administrador puede abrir **Registrar este producto** en otra pestaña, con el código completado en el formulario actual de Productos. Debe completar y guardar el resto de los datos. Después vuelve a la recepción y busca nuevamente el código. No se cierra ni se guarda automáticamente la recepción pendiente.

El almacenero recibe una indicación para solicitar el registro al administrador. No se amplían sus permisos.

## Alcance y privacidad

- La imagen se decodifica localmente mediante ZXing; no se envía al backend ni a un proveedor externo.
- Solo se consulta el código de barras en el catálogo existente. No se deducen nombres, lotes, vencimientos ni cantidades de la imagen.
- No hay creación automática de productos ni escritura de stock al escanear.
- Una foto ilegible, una sesión vencida, un producto inactivo, un 404 y un fallo de conexión muestran estados diferentes.
- Se intentan cuatro orientaciones. El formato del código debe estar admitido por el lector: EAN-13, EAN-8, UPC-A/E, Code 128, Code 39, ITF o Codabar. La legibilidad depende de la foto.
- La vista previa utiliza `getUserMedia` solo para video, sin micrófono. La lectura es continua hasta reconocer un código. Las pistas de la cámara se detienen al reconocer, cerrar, limpiar o salir del formulario, también si el permiso llega después de haber cancelado.
- La cámara requiere un contexto seguro: `localhost` en la PC o HTTPS. Hay mensajes específicos para permiso rechazado, cámara no encontrada, cámara ocupada y contexto no seguro.
- Esta entrega no configura acceso remoto desde el celular. La instalación actual utiliza URLs `localhost` en sus servicios; la conectividad desde otros dispositivos requiere una configuración adicional de direcciones/red y HTTPS para la cámara.
- No se modifica el backend, la lógica de recepción ni la pantalla POS.

## Verificación

Desde `frontend/farmagest-web`:

```sh
npm ci
npm run test:barcode
npm run build
```

Las pruebas cubren selección, ceros iniciales, productos inactivos, errores de catálogo, cancelación, validación de archivos y conservación de los datos de recepción sin guardar stock. Incluyen apertura de cámara sin micrófono, permisos y errores, reconocimiento automático único, alta de filas con datos completos, cierre y liberación de recursos tras cancelación o destrucción. También se comprobó la lectura real de imágenes de prueba EAN-13 JPEG y Code 128 PNG, imágenes giradas y una imagen sin código.

Pruebas manuales adicionales: usar una foto real de medicamento, reintentar la misma foto, limpiar durante una consulta, consultar un código inexistente, registrar el producto en otra pestaña y volver a buscarlo. Verificar permisos, vista previa y reconocimiento con una cámara física en la PC y en un teléfono real cuando esté configurado el acceso móvil.

## Registro desde Productos

En Nuevo Medicamento / Producto, Escanear con cámara y Subir foto completan únicamente el código de barras. No consultan productos existentes ni crean registros automáticamente. El administrador completa y guarda los demás campos.

La presentación inicia en Unidad y permite Frasco, Botella, Tubo, Sobre, Caja, Blíster, Tableta, Cápsula u Otra. El contenido opcional permite describir 400 ml, x 12 unidades o x 30 tabletas. Se conserva el campo de texto existente del backend; no se crean equivalencias de inventario o fraccionamientos de venta.
