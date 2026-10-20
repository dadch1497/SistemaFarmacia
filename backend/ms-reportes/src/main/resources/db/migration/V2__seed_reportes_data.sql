-- =====================================================================
-- FarmaGest — Migración V2: Semillas de demostración analítica para Dashboard
-- Base de datos: db_reportes
-- Genera estadísticas de las últimas semanas para visualizar métricas ejecutivas
-- =====================================================================

-- 1. Resumen diario de los últimos días
INSERT INTO `resumen_venta_diaria` 
(`sucursal_id`, `fecha`, `total_ventas`, `total_costo`, `total_utilidad`, `cantidad_transacciones`, `ticket_promedio`, `total_unidades_vendidas`)
VALUES
(1, CURDATE() - INTERVAL 6 DAY, 1420.50, 890.00, 530.50, 68, 20.89, 142),
(1, CURDATE() - INTERVAL 5 DAY, 1680.00, 1020.00, 660.00, 75, 22.40, 160),
(1, CURDATE() - INTERVAL 4 DAY, 1550.80, 940.00, 610.80, 71, 21.84, 151),
(1, CURDATE() - INTERVAL 3 DAY, 1890.20, 1150.00, 740.20, 84, 22.50, 195),
(1, CURDATE() - INTERVAL 2 DAY, 2450.00, 1480.00, 970.00, 110, 22.27, 260),
(1, CURDATE() - INTERVAL 1 DAY, 2150.40, 1310.00, 840.40, 92, 23.37, 220),
(1, CURDATE(), 1250.00, 760.00, 490.00, 52, 24.04, 115)
ON DUPLICATE KEY UPDATE `total_ventas` = VALUES(`total_ventas`);

-- 2. Métricas de Productos más vendidos del mes
INSERT INTO `metrica_producto_diaria`
(`sucursal_id`, `fecha`, `producto_id`, `nombre_producto`, `unidades_vendidas`, `monto_vendido`, `utilidad_generada`)
VALUES
(1, CURDATE(), 1, 'Paracetamol 500 mg', 420, 630.00, 420.00),
(1, CURDATE(), 2, 'Amoxicilina 500 mg', 180, 216.00, 108.00),
(1, CURDATE(), 3, 'Ibuprofeno 400 mg', 250, 200.00, 75.00),
(1, CURDATE(), 4, 'Alcohol 70° 1L', 95, 807.50, 237.50),
(1, CURDATE(), 5, 'Omeprazol 20 mg', 150, 180.00, 75.00)
ON DUPLICATE KEY UPDATE `unidades_vendidas` = VALUES(`unidades_vendidas`);

-- 3. Métricas de Vendedores
INSERT INTO `metrica_vendedor_diaria`
(`sucursal_id`, `fecha`, `usuario_id`, `nombre_vendedor`, `monto_total`, `total_ventas`)
VALUES
(1, CURDATE(), 2, 'Carlos Gómez Soto', 7850.50, 310),
(1, CURDATE(), 3, 'Lucía Morales Rivas', 6540.20, 265)
ON DUPLICATE KEY UPDATE `monto_total` = VALUES(`monto_total`);

-- 4. Métricas por Medio de Pago
INSERT INTO `metrica_pago_diaria`
(`sucursal_id`, `fecha`, `medio_pago`, `monto_total`, `total_transacciones`)
VALUES
(1, CURDATE(), 'EFECTIVO', 7900.00, 340),
(1, CURDATE(), 'YAPE_PLIN', 4320.00, 165),
(1, CURDATE(), 'TARJETA', 2170.70, 70)
ON DUPLICATE KEY UPDATE `monto_total` = VALUES(`monto_total`);

-- 5. Auditoría inicial de operaciones sensibles
INSERT INTO `log_auditoria`
(`sucursal_id`, `usuario_id`, `username`, `rol`, `accion`, `entidad_afectada`, `registro_id`, `valor_anterior`, `valor_nuevo`, `ip_origen`, `fecha_hora`)
VALUES
(1, 1, 'admin', 'ROLE_ADMINISTRADOR', 'CAMBIO_PRECIO', 'PRODUCTO', '1', '{"precioVenta": 1.20}', '{"precioVenta": 1.50, "motivo": "Ajuste inflacionario proveedor"}', '127.0.0.1', NOW() - INTERVAL 2 DAY),
(1, 1, 'admin', 'ROLE_ADMINISTRADOR', 'AJUSTE_STOCK', 'LOTE', 'LOTE-PARACETAMOL-2027', '{"stockActual": 105}', '{"stockActual": 100, "motivo": "Merma por frasco roto en almacén"}', '127.0.0.1', NOW() - INTERVAL 1 DAY),
(1, 1, 'admin', 'ROLE_ADMINISTRADOR', 'VENTA_ANULADA', 'VENTA', 'B001-00000001', '{"estado": "COMPLETADA", "total": 6.37}', '{"estado": "ANULADA", "motivo": "Cliente solicitó cambio de comprobante"}', '127.0.0.1', NOW() - INTERVAL 3 HOUR);
