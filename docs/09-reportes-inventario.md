# Reportes de inventario

Ruta: `/reportes/inventario`. Acceso: administrador y almacenero. El reporte de ventas permanece separado y restringido al administrador.

El servicio GET `/api/inventario/reportes` recibe `sucursalId`, `desde`, `hasta` y opcionalmente `productoId`. El almacenero solo puede consultar su sucursal. El período es inclusivo, de hasta 366 días, interpretado en America/Lima. Los timestamps de Kardex se almacenan en UTC; los registros históricos presuponen la zona UTC del entorno Docker original.

Movimientos muestra ingresos, salidas, referencias, usuario y saldo registrado. Mermas y ajustes permite revisar bajas y motivos. Valorización representa el stock actual consultado, independientemente del período: suma cantidad por costo de los lotes con saldo, incluyendo vencidos o retenidos. Expone unidades sin costo y diferencias entre stock consolidado y lotes.

La migración V3 agrega el costo unitario histórico del movimiento. Los movimientos nuevos conservan una copia del costo al registrarse. Los anteriores quedan sin costo histórico: no se reconstruye un precio pasado usando el costo actual. El costo conocido de mermas puede ser parcial.

PDF y Excel exportan todas las filas filtradas de la pestaña, no solo la página visible. Los códigos se conservan como texto y los importes conocidos como números en Excel. Si el resultado supera 10 000 movimientos se exige reducir el período o elegir un producto, sin truncar silenciosamente. Las consultas y exportaciones no modifican stock.

Validación: pruebas Maven de ms-inventario y `node --test tests/reporte-inventario.test.cjs` en frontend/farmagest-web.
