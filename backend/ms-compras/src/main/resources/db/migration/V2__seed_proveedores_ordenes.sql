-- =====================================================================
-- FarmaGest — ms-compras: Migración V2 (Datos iniciales de Proveedores y Órdenes)
-- =====================================================================

-- 1. Proveedores farmacéuticos peruanos
INSERT INTO proveedor (id, ruc, razon_social, nombre_contacto, telefono, email, direccion, activo, creado_en)
VALUES
(1, '20100055230', 'Droguería Los Andes S.A.C.', 'Juan Pérez', '01-456-7890', 'ventas@droguerialosandes.pe', 'Av. Elmer Faucett 1920, Callao', TRUE, NOW()),
(2, '20549812401', 'Distribuidora Farmacéutica del Perú S.A.', 'María Rojas', '01-321-6540', 'pedidos@difarpe.com.pe', 'Av. Venezuela 2400, Lima', TRUE, NOW()),
(3, '20489123091', 'Consorcio Médico Quirúrgico S.R.L.', 'Carlos Mendoza', '01-789-1234', 'contacto@consorciomedico.pe', 'Av. Javier Prado Este 4500, Ate', TRUE, NOW())
ON DUPLICATE KEY UPDATE razon_social = VALUES(razon_social);

-- 2. Orden de Compra inicial pendiente para reposición de Ibuprofeno y Amoxicilina
INSERT INTO orden_compra (id, numero_orden, proveedor_id, sucursal_id, estado, subtotal, igv, total, usuario_creador_id, fecha_emision, fecha_esperada, observaciones)
VALUES
(1, 'OC-2026-0001', 1, 1, 'APROBADA', 100.00, 18.00, 118.00, 1, NOW(), DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'Reposición urgente de stock de seguridad para Ate')
ON DUPLICATE KEY UPDATE total = VALUES(total);

-- 3. Detalle de la Orden de Compra inicial (Ibuprofeno: 100 un. a S/ 0.28, Amoxicilina: 50 un. a S/ 1.10)
INSERT INTO detalle_orden_compra (id, orden_compra_id, producto_id, cantidad_solicitada, costo_pactado, subtotal)
VALUES
(1, 1, 3, 100, 0.28, 28.00),
(2, 1, 2, 65, 1.10, 71.50)
ON DUPLICATE KEY UPDATE subtotal = VALUES(subtotal);
