-- 1. Insertar cliente Yanett Chávez si no existe
INSERT INTO db_ventas.cliente 
(id, tipo_documento, numero_documento, nombres_o_razon_social, direccion, telefono, email, activo)
VALUES
(9, 'DNI', '09189262', 'YANETT CHAVEZ LEZCANO', 'Lima', '', '', 1)
ON DUPLICATE KEY UPDATE nombres_o_razon_social = VALUES(nombres_o_razon_social);

-- 2. Limpiar las ventas de prueba anteriores
DELETE FROM db_ventas.detalle_devolucion;
DELETE FROM db_ventas.devolucion;
DELETE FROM db_ventas.detalle_venta;
DELETE FROM db_ventas.venta;

-- 3. Insertar las 5 ventas oficiales de Octubre 2026
-- B001-00000001
INSERT INTO db_ventas.venta 
(id, sucursal_id, sesion_caja_id, cliente_id, usuario_vendedor_id, tipo_comprobante, serie_comprobante, numero_comprobante, subtotal, monto_descuento, igv, total, medio_pago, monto_recibido, vuelto, estado, fecha_hora, observaciones)
VALUES
(1, 1, 1, 1, 2, 'BOLETA', 'B001', '00000001', 0.76, 0.00, 0.14, 0.90, 'EFECTIVO', 1.00, 0.10, 'COMPLETADA', '2026-10-28 10:15:00', 'Comprobante SUNAT Octubre 2026');

-- B001-00000002
INSERT INTO db_ventas.venta 
(id, sucursal_id, sesion_caja_id, cliente_id, usuario_vendedor_id, tipo_comprobante, serie_comprobante, numero_comprobante, subtotal, monto_descuento, igv, total, medio_pago, monto_recibido, vuelto, estado, fecha_hora, observaciones)
VALUES
(2, 1, 1, 1, 3, 'BOLETA', 'B001', '00000002', 0.76, 0.00, 0.14, 0.90, 'EFECTIVO', 1.00, 0.10, 'COMPLETADA', '2026-10-28 11:30:00', 'Comprobante SUNAT Octubre 2026');

-- B001-00000003 (Anulada con NC BC01-00000001)
INSERT INTO db_ventas.venta 
(id, sucursal_id, sesion_caja_id, cliente_id, usuario_vendedor_id, tipo_comprobante, serie_comprobante, numero_comprobante, subtotal, monto_descuento, igv, total, medio_pago, monto_recibido, vuelto, estado, fecha_hora, observaciones)
VALUES
(3, 1, 1, 9, 3, 'BOLETA', 'B001', '00000003', 0.76, 0.00, 0.14, 0.90, 'EFECTIVO', 1.00, 0.10, 'ANULADA', '2026-10-28 12:00:00', 'Anulada por Nota de Crédito BC01-00000001');

-- B001-00000004
INSERT INTO db_ventas.venta 
(id, sucursal_id, sesion_caja_id, cliente_id, usuario_vendedor_id, tipo_comprobante, serie_comprobante, numero_comprobante, subtotal, monto_descuento, igv, total, medio_pago, monto_recibido, vuelto, estado, fecha_hora, observaciones)
VALUES
(4, 1, 1, 1, 1, 'BOLETA', 'B001', '00000004', 0.42, 0.00, 0.08, 0.50, 'EFECTIVO', 1.00, 0.50, 'COMPLETADA', '2026-10-29 00:04:29', 'Comprobante SUNAT con CDR firmado');

-- B001-00000005
INSERT INTO db_ventas.venta 
(id, sucursal_id, sesion_caja_id, cliente_id, usuario_vendedor_id, tipo_comprobante, serie_comprobante, numero_comprobante, subtotal, monto_descuento, igv, total, medio_pago, monto_recibido, vuelto, estado, fecha_hora, observaciones)
VALUES
(5, 1, 1, 1, 2, 'BOLETA', 'B001', '00000005', 0.76, 0.00, 0.14, 0.90, 'EFECTIVO', 0.90, 0.00, 'COMPLETADA', '2026-10-29 06:21:28', 'Comprobante SUNAT con CDR firmado');

-- 4. Insertar detalles de las 5 ventas
INSERT INTO db_ventas.detalle_venta
(id, venta_id, producto_id, lote_id, numero_lote, cantidad, precio_unitario, costo_unitario, descuento_linea, subtotal_linea)
VALUES
(1, 1, 2, 2, 'L-2024-IBU1', 1, 0.90, 0.40, 0.00, 0.90),
(2, 2, 2, 2, 'L-2024-IBU1', 1, 0.90, 0.40, 0.00, 0.90),
(3, 3, 2, 2, 'L-2024-IBU1', 1, 0.90, 0.40, 0.00, 0.90),
(4, 4, 1, 1, 'L-2024-ALC', 1, 0.50, 0.22, 0.00, 0.50),
(5, 5, 2, 2, 'L-2024-IBU1', 1, 0.90, 0.40, 0.00, 0.90);

-- 5. Insertar la Nota de Crédito oficial de Octubre 2026 (BC01-00000001)
INSERT INTO db_ventas.devolucion
(id, venta_id, usuario_id, sucursal_id, motivo, total_devuelto, fecha_hora, serie_nota_credito, numero_nota_credito, tipo_nota_credito, descripcion_tipo_nc, subtotal_devuelto, igv_devuelto, medio_reembolso, hash_cpe, qr_code_url, estado_sunat)
VALUES
(1, 3, 1, 1, 'Devolución de comprobante B001-3', 0.90, '2026-10-28 14:10:00', 'BC01', '00000001', '07', 'Anulación de la operación', 0.76, 0.14, 'EFECTIVO', 'eWdlc3Qtbm90YS1jcmVkaXRvLWJjMDE=', 'https://sunat.gob.pe/cpe?ruc=10734577583&tipo=07&serie=BC01&numero=00000001&monto=0.90&fecha=2026-10-28', 'ACEPTADA');

INSERT INTO db_ventas.detalle_devolucion
(id, devolucion_id, producto_id, nombre_producto, lote_id, cantidad, monto_reembolsado, numero_lote, precio_unitario, reingresa_a_stock)
VALUES
(1, 1, 2, 'Ibuprofeno 400 mg', 2, 1, 0.90, 'L-2024-IBU1', 0.90, 1);

-- 6. Actualizar db_reportes con métricas de Octubre 2026 y dejar Noviembre en 0
DELETE FROM db_reportes.resumen_venta_diaria WHERE fecha >= '2026-11-01';
DELETE FROM db_reportes.metrica_producto_diaria WHERE fecha >= '2026-11-01';
DELETE FROM db_reportes.metrica_pago_diaria WHERE fecha >= '2026-11-01';
DELETE FROM db_reportes.metrica_vendedor_diaria WHERE fecha >= '2026-11-01';

-- Métricas para el 28 de Octubre (3 boletas de 0.90 = 2.70, menos NC 0.90 = 1.80 neto)
INSERT INTO db_reportes.resumen_venta_diaria
(sucursal_id, fecha, total_ventas, total_costo, total_utilidad, cantidad_transacciones, ticket_promedio, total_unidades_vendidas)
VALUES
(1, '2026-10-28', 1.80, 0.80, 1.00, 2, 0.90, 2)
ON DUPLICATE KEY UPDATE total_ventas = 1.80, total_costo = 0.80, total_utilidad = 1.00;

-- Métricas para el 29 de Octubre (B001-4 de 0.50 + B001-5 de 0.90 = 1.40)
INSERT INTO db_reportes.resumen_venta_diaria
(sucursal_id, fecha, total_ventas, total_costo, total_utilidad, cantidad_transacciones, ticket_promedio, total_unidades_vendidas)
VALUES
(1, '2026-10-29', 1.40, 0.62, 0.78, 2, 0.70, 2)
ON DUPLICATE KEY UPDATE total_ventas = 1.40, total_costo = 0.62, total_utilidad = 0.78;
