-- =====================================================================
-- FarmaGest ms-ventas: V2__seed_ventas_data.sql
-- Cajas, Clientes iniciales, Promociones y Cupones
-- =====================================================================

INSERT INTO `caja` (`id`, `sucursal_id`, `nombre`, `codigo`, `activo`) VALUES
(1, 1, 'Caja Principal POS 01', 'CAJA-01', TRUE),
(2, 1, 'Caja Rápida POS 02', 'CAJA-02', TRUE);

INSERT INTO `cliente` (`id`, `tipo_documento`, `numero_documento`, `nombres_o_razon_social`, `direccion`, `telefono`, `email`, `activo`) VALUES
(1, 'DNI', '00000000', 'CLIENTE GENÉRICO / VARIOS', 'Mostrador Farmacia', '000000000', 'sin_correo@farmagest.pe', TRUE),
(2, 'DNI', '10485923', 'Juan Carlos Pérez Morales', 'Jr. Las Begonias 342, Ate, Lima', '987654321', 'jperez@gmail.com', TRUE),
(3, 'DNI', '45892314', 'María Elena Flores Ramos', 'Av. José Carlos Mariátegui 128, Ate', '998877665', 'mflores@outlook.com', TRUE),
(4, 'RUC', '20601234567', 'Botica Popular Ate S.A.C.', 'Av. Nicolás Ayllón 4500, Ate, Lima', '013567890', 'facturacion@boticapopular.pe', TRUE);

INSERT INTO `promocion` (`id`, `nombre`, `tipo_alcance`, `tipo_descuento`, `valor_descuento`, `cantidad_condicion`, `cantidad_pagada`, `fecha_inicio`, `fecha_fin`, `aplica_por_vencimiento`, `activo`) VALUES
(1, '10% de Descuento en Vitaminas', 'POR_CATEGORIA', 'PORCENTAJE', 10.00, NULL, NULL, '2026-01-01', '2027-12-31', FALSE, TRUE),
(2, 'Promoción 2x1 en Paracetamol 500mg', 'POR_PRODUCTO', 'N_X_M', NULL, 2, 1, '2026-01-01', '2027-12-31', FALSE, TRUE),
(3, 'Descuento de Liquidación por Próximo a Vencer', 'POR_VENCIMIENTO_PROXIMO', 'PORCENTAJE', 25.00, NULL, NULL, '2026-01-01', '2027-12-31', TRUE, TRUE);

INSERT INTO `cupon` (`id`, `promocion_id`, `codigo`, `porcentaje_descuento`, `monto_fijo_descuento`, `usos_permitidos`, `usos_actuales`, `fecha_expiracion`, `activo`) VALUES
(1, NULL, 'BIENVENIDA2026', 15.00, 0.00, 500, 0, '2027-12-31', TRUE),
(2, NULL, 'FARMA10', 10.00, 0.00, 200, 0, '2027-12-31', TRUE),
(3, NULL, 'BOTICA5', 5.00, 0.00, 1000, 0, '2027-12-31', TRUE);
