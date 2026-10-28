# Conteo físico ciego y comparación

Ruta `/inventario/conteos`, menú Conteo físico. Administrador y almacenero pueden iniciar y consultar conteos de su sucursal; el administrador puede acceder a otras sucursales mediante API. Solo el responsable o un administrador pueden editar/cerrar/cancelar. La revisión final es exclusiva del administrador. Se conserva usuario y fecha UTC (mostradas en hora Lima).

## Alcance y unidades

El modelo existente no tiene ubicaciones por estante: zona/referencia es descriptiva. Cada producto se cuenta en el total de su sucursal, incluyendo todos sus estantes/lotes. Se pueden contar subconjuntos de productos: lo omitido nunca se interpreta como cero. No es un conteo por lote ni un sustituto del control FEFO.

La cantidad se registra en unidades base del Kardex, entera entre 0 y 100000000. El escaneo identifica un SKU, no incrementa la cantidad. Si se repite un SKU se reemplaza su total y se audita el valor anterior/nuevo. No se deducen factores de conversión de cajas o blísteres a partir de un código: el responsable debe convertir a las unidades base usadas en inventario. El sistema no cuenta automáticamente objetos de una foto.

## Consistencia y trazabilidad

Al iniciar se toma una copia del stock consolidado y su última actualización bajo lectura bloqueante breve; también el máximo ID de Kardex de la sucursal. Se guardan los valores esperados en el backend, sin devolverlos en el conteo abierto. La copia se toma para todo el stock existente, pero solo se muestran y comparan los productos efectivamente contados.

Al finalizar se bloquean brevemente los saldos para leerlos y se revisa, por producto: si apareció un movimiento posterior al marcador, cambió el saldo o cambió su fecha de actualización. Cualquiera de esos cambios produce REQUIERE_RECONTEO y oculta la diferencia, incluso si movimientos opuestos dejaron el mismo saldo. No se reconstruye un saldo físico supuesto durante ventas. Se recomienda contar en una pausa operativa; si hubo movimientos, iniciar otra sesión para esos productos.

Sin cambios se compara cantidad física menos stock inicial: negativo FALTANTE, positivo SOBRANTE, cero CONFORME. No se toca producto_stock, lotes ni Kardex. Las diferencias no prueban robo. Se permite una revisión documentada del administrador sin ajustes automáticos. Un segundo conteo se realiza en una nueva sesión; no se afirma tener un flujo formal de aprobación de ajustes.

Los conteos cerrados o cancelados no admiten edición. La auditoría conserva inicio, cambios de cantidad, cierre/cancelación, foto y revisión. No hay endpoints de borrado. Las acciones se serializan bloqueando la sesión. La identidad del producto se verifica en ms-catalogo usando la autorización del solicitante, sin aceptar nombre/código manipulados desde el navegador.

## Evidencia

Una foto opcional por sesión, JPG/PNG/WebP hasta 8 MB. Se guarda en base de datos, requiere autorización para verla y no se reemplaza ni se borra mediante la API. No representa un conteo automático. La cámara reutiliza el lector local de códigos; una cámara de celular requiere acceso HTTPS y configuración de red adecuada. La app actual continúa ejecutándose localmente: esta entrega no publica un acceso remoto al celular.

## API y pruebas

Base `/api/inventario/conteos`: GET lista paginada de 20; POST inicia; GET /{id} detalle; PUT /{id}/lineas registra total; POST /{id}/finalizar compara; POST /{id}/cancelar conserva evidencia; POST /{id}/revision documenta revisión; POST/GET /{id}/foto adjunta/consulta imagen.

Migración V4 agrega cuatro tablas independientes. Pruebas Maven ms-inventario: permisos, ocultación de saldo, comparación, movimientos de saldo neto cero, cierre inmutable, auditoría, cero/fracciones y archivos inválidos. Pruebas frontend `node --test tests/conteo.test.cjs`: escaneo sin incremento, edición de total, cantidad cero, errores y respuestas antiguas. La comprobación de cámara física requiere el dispositivo y permiso del navegador.
