-- V2: Semilla de Categorías y Laboratorios Maestros

INSERT INTO `categoria` (`id`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'Analgésicos', 'Medicamentos para el alivio del dolor y fiebre', TRUE),
(2, 'Antibióticos', 'Fármacos para combatir infecciones bacterianas', TRUE),
(3, 'Antialérgicos', 'Antihistamínicos para alergias respiratorias y dérmicas', TRUE),
(4, 'Gastrointestinal', 'Protectores gástricos, antiácidos y digestivos', TRUE),
(5, 'Vitaminas', 'Suplementos nutricionales y multivitamínicos', TRUE),
(6, 'Cuidado personal', 'Higiene, antisépticos y primeros auxilios', TRUE)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `laboratorio` (`id`, `nombre`, `pais_origen`, `activo`) VALUES
(1, 'Medifarma', 'Perú', TRUE),
(2, 'Laboratorios Portugal', 'Perú', TRUE),
(3, 'IQ Farma', 'Perú', TRUE),
(4, 'Bayer', 'Alemania', TRUE),
(5, 'Pfizer', 'Estados Unidos', TRUE),
(6, 'Farmindustria', 'Perú', TRUE)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);
