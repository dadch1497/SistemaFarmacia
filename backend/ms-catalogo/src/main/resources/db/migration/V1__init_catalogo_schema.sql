-- V1: Esquema de base de datos para ms-catalogo (db_catalogo)

CREATE TABLE IF NOT EXISTS `categoria` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL UNIQUE,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX `idx_categoria_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `laboratorio` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL UNIQUE,
    `pais_origen` VARCHAR(80) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX `idx_laboratorio_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `producto` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `codigo_barras` VARCHAR(30) NOT NULL UNIQUE,
    `nombre` VARCHAR(150) NOT NULL,
    `principio_activo` VARCHAR(150) NULL,
    `concentracion` VARCHAR(50) NULL,
    `presentacion` VARCHAR(100) NOT NULL,
    `categoria_id` INT NOT NULL,
    `laboratorio_id` INT NOT NULL,
    `precio_venta` DECIMAL(10,2) NOT NULL,
    `precio_costo` DECIMAL(10,2) NOT NULL,
    `requiere_receta` BOOLEAN NOT NULL DEFAULT FALSE,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`),
    CONSTRAINT `fk_producto_laboratorio` FOREIGN KEY (`laboratorio_id`) REFERENCES `laboratorio` (`id`),
    INDEX `idx_producto_nombre` (`nombre`),
    INDEX `idx_producto_codigo` (`codigo_barras`),
    INDEX `idx_producto_categoria` (`categoria_id`),
    INDEX `idx_producto_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `historial_precio` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `producto_id` BIGINT NOT NULL,
    `precio_anterior` DECIMAL(10,2) NOT NULL,
    `precio_nuevo` DECIMAL(10,2) NOT NULL,
    `costo_anterior` DECIMAL(10,2) NOT NULL,
    `costo_nuevo` DECIMAL(10,2) NOT NULL,
    `motivo` VARCHAR(255) NULL,
    `usuario_id` BIGINT NOT NULL,
    `fecha_cambio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_historial_producto` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`) ON DELETE CASCADE,
    INDEX `idx_historial_producto` (`producto_id`),
    INDEX `idx_historial_fecha` (`fecha_cambio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
