-- 1. Cerrar la sesión antigua de Caja 1 para desbloquearla
UPDATE db_ventas.sesion_caja 
SET estado = 'CERRADA', 
    monto_cierre_sistema = 101.00, 
    monto_cierre_real = 101.00, 
    diferencia = 0.00, 
    fecha_cierre = '2026-11-06 23:59:59', 
    observaciones = 'Cierre de turno anterior del vendedor1' 
WHERE id = 1;

-- 2. Insertar las boletas reales emitidas a SUNAT (B001-00000004 y B001-00000005)
INSERT INTO db_ventas.venta 
(id, sucursal_id, sesion_caja_id, cliente_id, usuario_vendedor_id, tipo_comprobante, serie_comprobante, numero_comprobante, subtotal, monto_descuento, igv, total, medio_pago, monto_recibido, vuelto, estado, fecha_hora, observaciones)
VALUES
(1, 1, 1, 1, 1, 'BOLETA', 'B001', '00000004', 0.42, 0.00, 0.08, 0.50, 'EFECTIVO', 0.50, 0.00, 'COMPLETADA', '2026-11-08 00:30:00', 'Comprobante electrónico emitido a SUNAT con CDR firmado'),
(2, 1, 1, 1, 1, 'BOLETA', 'B001', '00000005', 0.42, 0.00, 0.08, 0.50, 'EFECTIVO', 1.00, 0.50, 'COMPLETADA', '2026-11-08 00:45:00', 'Comprobante electrónico emitido a SUNAT con CDR firmado')
ON DUPLICATE KEY UPDATE 
serie_comprobante = VALUES(serie_comprobante), 
numero_comprobante = VALUES(numero_comprobante), 
total = VALUES(total);

-- 3. Insertar detalle de venta para cada boleta
INSERT INTO db_ventas.detalle_venta
(id, venta_id, producto_id, lote_id, numero_lote, cantidad, precio_unitario, costo_unitario, descuento_linea, subtotal_linea)
VALUES
(1, 1, 1, 1, 'L-2024-ALC', 1, 0.50, 0.22, 0.00, 0.50),
(2, 2, 1, 1, 'L-2024-ALC', 1, 0.50, 0.22, 0.00, 0.50)
ON DUPLICATE KEY UPDATE 
subtotal_linea = VALUES(subtotal_linea);

-- 4. Registrar métricas en db_reportes para que aparezcan en Dashboard y Reportes
INSERT INTO db_reportes.resumen_venta_diaria
(sucursal_id, fecha, total_ventas, total_costo, total_utilidad, cantidad_transacciones, ticket_promedio, total_unidades_vendidas)
VALUES
(1, '2026-11-08', 1.00, 0.44, 0.56, 2, 0.50, 2)
ON DUPLICATE KEY UPDATE 
total_ventas = 1.00, total_costo = 0.44, total_utilidad = 0.56, cantidad_transacciones = 2, ticket_promedio = 0.50, total_unidades_vendidas = 2;

INSERT INTO db_reportes.metrica_producto_diaria
(sucursal_id, fecha, producto_id, nombre_producto, unidades_vendidas, monto_vendido, utilidad_generada)
VALUES (1, '2026-11-08', 1, 'Paracetamol 500 mg', 2, 1.00, 0.56)
ON DUPLICATE KEY UPDATE unidades_vendidas = 2, monto_vendido = 1.00, utilidad_generada = 0.56;

INSERT INTO db_reportes.metrica_pago_diaria
(sucursal_id, fecha, medio_pago, monto_total, total_transacciones)
VALUES (1, '2026-11-08', 'EFECTIVO', 1.00, 2)
ON DUPLICATE KEY UPDATE monto_total = 1.00, total_transacciones = 2;

INSERT INTO db_reportes.metrica_vendedor_diaria
(sucursal_id, fecha, usuario_id, nombre_vendedor, monto_total, total_ventas)
VALUES (1, '2026-11-08', 1, 'Administrador Farma Ochenta', 1.00, 2)
ON DUPLICATE KEY UPDATE monto_total = 1.00, total_ventas = 2;
