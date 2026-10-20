-- =====================================================================
-- FarmaGest — ms-inventario: Migración V2 (Datos iniciales de Lotes y Stock)
-- =====================================================================

-- 1. Insertar Lotes de ejemplo vinculados a los 7 productos del catálogo
INSERT INTO lote (id, producto_id, sucursal_id, numero_lote, fecha_vencimiento, cantidad_inicial, cantidad_actual, costo_unitario, estado, creado_en)
VALUES
(1, 1, 1, 'L-2024-ALC', DATE_ADD(CURRENT_DATE, INTERVAL 240 DAY), 50, 50, 3.80, 'DISPONIBLE', NOW()),
(2, 2, 1, 'L-2024-AMX1', DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 30, 30, 1.10, 'DISPONIBLE', NOW()),
(3, 2, 1, 'L-2025-AMX2', DATE_ADD(CURRENT_DATE, INTERVAL 180 DAY), 50, 50, 1.10, 'DISPONIBLE', NOW()),
(4, 3, 1, 'L-2024-IBU', DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), 50, 8, 0.28, 'DISPONIBLE', NOW()),
(5, 4, 1, 'L-2025-OME', DATE_ADD(CURRENT_DATE, INTERVAL 365 DAY), 120, 120, 0.65, 'DISPONIBLE', NOW()),
(6, 5, 1, 'L-2024-CET', DATE_ADD(CURRENT_DATE, INTERVAL 75 DAY), 40, 40, 0.40, 'DISPONIBLE', NOW()),
(7, 6, 1, 'L-2025-LOS', DATE_ADD(CURRENT_DATE, INTERVAL 300 DAY), 60, 60, 0.50, 'DISPONIBLE', NOW()),
(8, 7, 1, 'L-2026-JER', DATE_ADD(CURRENT_DATE, INTERVAL 720 DAY), 200, 200, 0.55, 'DISPONIBLE', NOW())
ON DUPLICATE KEY UPDATE cantidad_actual = VALUES(cantidad_actual);

-- 2. Consolidado de stock por producto en Sucursal 1 (Ate - Principal)
INSERT INTO producto_stock (id, producto_id, sucursal_id, stock_actual, stock_minimo, stock_maximo, actualizado_en)
VALUES
(1, 1, 1, 50, 15, 150, NOW()),
(2, 2, 1, 80, 20, 200, NOW()),
(3, 3, 1, 8, 20, 100, NOW()), -- Stock bajo (8 <= 20)
(4, 4, 1, 120, 25, 300, NOW()),
(5, 5, 1, 40, 15, 100, NOW()),
(6, 6, 1, 60, 20, 150, NOW()),
(7, 7, 1, 200, 50, 500, NOW())
ON DUPLICATE KEY UPDATE stock_actual = VALUES(stock_actual);

-- 3. Kardex inicial de recepción / inventario de apertura
INSERT INTO movimiento_kardex (producto_id, lote_id, sucursal_id, tipo_movimiento, cantidad, saldo_resultante, referencia_tipo, referencia_id, motivo, usuario_id, fecha_hora)
VALUES
(1, 1, 1, 'INGRESO_INICIAL', 50, 50, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW()),
(2, 2, 1, 'INGRESO_INICIAL', 30, 30, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW()),
(2, 3, 1, 'INGRESO_INICIAL', 50, 80, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW()),
(3, 4, 1, 'INGRESO_INICIAL', 8, 8, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW()),
(4, 5, 1, 'INGRESO_INICIAL', 120, 120, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW()),
(5, 6, 1, 'INGRESO_INICIAL', 40, 40, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW()),
(6, 7, 1, 'INGRESO_INICIAL', 60, 60, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW()),
(7, 8, 1, 'INGRESO_INICIAL', 200, 200, 'INICIAL', 'INI-001', 'Carga inicial de inventario', 1, NOW());

-- 4. Alertas iniciales generadas
INSERT INTO alerta_inventario (producto_id, lote_id, sucursal_id, tipo_alerta, mensaje, nivel_urgencia, atendida, fecha_alerta)
VALUES
(2, 2, 1, 'VENCIMIENTO_30_DIAS', 'Lote L-2024-AMX1 de Amoxicilina 500 mg vence en menos de 30 días (Crítico FEFO)', 3, FALSE, NOW()),
(3, 4, 1, 'STOCK_MINIMO', 'Stock de Ibuprofeno 400 mg (8 un.) está por debajo del mínimo de seguridad (20 un.)', 2, FALSE, NOW()),
(3, 4, 1, 'VENCIMIENTO_60_DIAS', 'Lote L-2024-IBU de Ibuprofeno 400 mg vence en 45 días', 2, FALSE, NOW());
