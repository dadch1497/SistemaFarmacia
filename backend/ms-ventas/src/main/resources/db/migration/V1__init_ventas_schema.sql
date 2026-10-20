-- =====================================================================
-- FarmaGest ms-ventas: V1__init_ventas_schema.sql
-- Tablas para POS, Ventas, Cajas, Clientes, Promociones y Devoluciones
-- =====================================================================

CREATE TABLE IF NOT EXISTS `caja` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `nombre` VARCHAR(100) NOT NULL,
    `codigo` VARCHAR(30) NOT NULL UNIQUE,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sesion_caja` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `caja_id` INT NOT NULL,
    `usuario_id` BIGINT NOT NULL,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `monto_apertura` DECIMAL(10,2) NOT NULL,
    `monto_cierre_sistema` DECIMAL(10,2) NULL,
    `monto_cierre_real` DECIMAL(10,2) NULL,
    `diferencia` DECIMAL(10,2) NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    `fecha_apertura` DATETIME NOT NULL,
    `fecha_cierre` DATETIME NULL,
    `observaciones` TEXT NULL,
    FOREIGN KEY (`caja_id`) REFERENCES `caja`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cliente` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tipo_documento` VARCHAR(20) NOT NULL DEFAULT 'DNI',
    `numero_documento` VARCHAR(20) NOT NULL UNIQUE,
    `nombres_o_razon_social` VARCHAR(150) NOT NULL,
    `direccion` VARCHAR(200) NULL,
    `telefono` VARCHAR(30) NULL,
    `email` VARCHAR(100) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `promocion` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(150) NOT NULL,
    `tipo_alcance` VARCHAR(30) NOT NULL DEFAULT 'POR_PRODUCTO',
    `tipo_descuento` VARCHAR(20) NOT NULL DEFAULT 'PORCENTAJE',
    `valor_descuento` DECIMAL(10,2) NULL,
    `cantidad_condicion` INT NULL,
    `cantidad_pagada` INT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `aplica_por_vencimiento` BOOLEAN NOT NULL DEFAULT FALSE,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cupon` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `promocion_id` BIGINT NULL,
    `codigo` VARCHAR(50) NOT NULL UNIQUE,
    `porcentaje_descuento` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `monto_fijo_descuento` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `usos_permitidos` INT NOT NULL DEFAULT 100,
    `usos_actuales` INT NOT NULL DEFAULT 0,
    `fecha_expiracion` DATE NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (`promocion_id`) REFERENCES `promocion`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `venta` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `sesion_caja_id` BIGINT NOT NULL,
    `cliente_id` BIGINT NULL,
    `usuario_vendedor_id` BIGINT NOT NULL,
    `tipo_comprobante` VARCHAR(20) NOT NULL,
    `serie_comprobante` VARCHAR(10) NOT NULL,
    `numero_comprobante` VARCHAR(20) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    `monto_descuento` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `igv` DECIMAL(10,2) NOT NULL,
    `total` DECIMAL(10,2) NOT NULL,
    `medio_pago` VARCHAR(30) NOT NULL,
    `monto_recibido` DECIMAL(10,2) NULL,
    `vuelto` DECIMAL(10,2) NULL,
    `promocion_id` BIGINT NULL,
    `cupon_id` BIGINT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA',
    `fecha_hora` DATETIME NOT NULL,
    `observaciones` TEXT NULL,
    FOREIGN KEY (`sesion_caja_id`) REFERENCES `sesion_caja`(`id`),
    FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`),
    FOREIGN KEY (`promocion_id`) REFERENCES `promocion`(`id`),
    FOREIGN KEY (`cupon_id`) REFERENCES `cupon`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `detalle_venta` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `venta_id` BIGINT NOT NULL,
    `producto_id` BIGINT NOT NULL,
    `lote_id` BIGINT NULL,
    `numero_lote` VARCHAR(50) NULL,
    `cantidad` INT NOT NULL,
    `precio_unitario` DECIMAL(10,2) NOT NULL,
    `costo_unitario` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `descuento_linea` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `subtotal_linea` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`venta_id`) REFERENCES `venta`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `venta_espera` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` BIGINT NOT NULL,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `codigo_espera` VARCHAR(50) NOT NULL UNIQUE,
    `nombre_referencia` VARCHAR(100) NULL,
    `datos_json` TEXT NOT NULL,
    `fecha_hora` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `devolucion` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `venta_id` BIGINT NOT NULL,
    `usuario_id` BIGINT NOT NULL,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `motivo` VARCHAR(255) NOT NULL,
    `total_devuelto` DECIMAL(10,2) NOT NULL,
    `fecha_hora` DATETIME NOT NULL,
    FOREIGN KEY (`venta_id`) REFERENCES `venta`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `detalle_devolucion` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `devolucion_id` BIGINT NOT NULL,
    `producto_id` BIGINT NOT NULL,
    `lote_id` BIGINT NULL,
    `cantidad` INT NOT NULL,
    `monto_reembolsado` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`devolucion_id`) REFERENCES `devolucion`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
