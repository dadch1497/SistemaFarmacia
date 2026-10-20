-- V3: Semilla de los 7 productos iniciales requeridos para FarmaGest

INSERT INTO `producto` (
    `id`, `codigo_barras`, `nombre`, `principio_activo`, `concentracion`,
    `presentacion`, `categoria_id`, `laboratorio_id`, `precio_venta`,
    `precio_costo`, `requiere_receta`, `activo`
) VALUES
(1, '7751234567890', 'Paracetamol 500 mg', 'Paracetamol', '500 mg', 'Tableta', 1, 2, 0.50, 0.22, FALSE, TRUE),
(2, '7751234567891', 'Ibuprofeno 400 mg', 'Ibuprofeno', '400 mg', 'Tableta', 1, 1, 0.90, 0.40, FALSE, TRUE),
(3, '7751234567892', 'Amoxicilina 500 mg', 'Amoxicilina', '500 mg', 'Cápsula', 2, 6, 2.50, 1.20, TRUE, TRUE),
(4, '7751234567893', 'Loratadina 10 mg', 'Loratadina', '10 mg', 'Tableta', 3, 2, 0.70, 0.30, FALSE, TRUE),
(5, '7751234567894', 'Omeprazol 20 mg', 'Omeprazol', '20 mg', 'Cápsula', 4, 3, 1.50, 0.65, FALSE, TRUE),
(6, '7751234567895', 'Vitamina C 1 g', 'Ácido Ascórbico', '1 g', 'Tableta efervescente', 5, 4, 2.00, 0.90, FALSE, TRUE),
(7, '7751234567896', 'Alcohol 70° 250 ml', 'Alcohol Etílico 70°', '70°', 'Frasco 250 ml', 6, 2, 6.00, 3.80, FALSE, TRUE)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);
