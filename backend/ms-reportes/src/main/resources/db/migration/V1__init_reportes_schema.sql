-- =====================================================================
-- FarmaGest — Migración V1: Esquema de Reportes, KPIs y Auditoría
-- Base de datos: db_reportes
-- =====================================================================

-- 1. Resumen de Venta Diaria (Consolidado a nivel sucursal y fecha)
CREATE TABLE IF NOT EXISTS `resumen_venta_diaria` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `fecha` DATE NOT NULL,
    `total_ventas` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `total_costo` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `total_utilidad` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `cantidad_transacciones` INT NOT NULL DEFAULT 0,
    `ticket_promedio` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_unidades_vendidas` INT NOT NULL DEFAULT 0,
    `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_sucursal_fecha` (`sucursal_id`, `fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Métricas de Productos por Día (Top ranking de ventas)
CREATE TABLE IF NOT EXISTS `metrica_producto_diaria` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `fecha` DATE NOT NULL,
    `producto_id` BIGINT NOT NULL,
    `nombre_producto` VARCHAR(200) NOT NULL,
    `unidades_vendidas` INT NOT NULL DEFAULT 0,
    `monto_vendido` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `utilidad_generada` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    UNIQUE KEY `uk_sucursal_fecha_prod` (`sucursal_id`, `fecha`, `producto_id`),
    INDEX `idx_fecha_unidades` (`fecha`, `unidades_vendidas` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Métricas de Vendedores por Día
CREATE TABLE IF NOT EXISTS `metrica_vendedor_diaria` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `fecha` DATE NOT NULL,
    `usuario_id` BIGINT NOT NULL,
    `nombre_vendedor` VARCHAR(150) NOT NULL,
    `monto_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `total_ventas` INT NOT NULL DEFAULT 0,
    UNIQUE KEY `uk_sucursal_fecha_vendedor` (`sucursal_id`, `fecha`, `usuario_id`),
    INDEX `idx_fecha_monto` (`fecha`, `monto_total` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Métricas por Medio de Pago por Día
CREATE TABLE IF NOT EXISTS `metrica_pago_diaria` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `fecha` DATE NOT NULL,
    `medio_pago` VARCHAR(30) NOT NULL,
    `monto_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `total_transacciones` INT NOT NULL DEFAULT 0,
    UNIQUE KEY `uk_sucursal_fecha_pago` (`sucursal_id`, `fecha`, `medio_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bitácora Inmutable de Auditoría
CREATE TABLE IF NOT EXISTS `log_auditoria` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sucursal_id` INT NOT NULL DEFAULT 1,
    `usuario_id` BIGINT NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `rol` VARCHAR(50) NOT NULL,
    `accion` VARCHAR(50) NOT NULL,
    `entidad_afectada` VARCHAR(50) NOT NULL,
    `registro_id` VARCHAR(50) NOT NULL,
    `valor_anterior` TEXT NULL,
    `valor_nuevo` TEXT NULL,
    `ip_origen` VARCHAR(45) NULL,
    `fecha_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_auditoria_fecha` (`fecha_hora` DESC),
    INDEX `idx_auditoria_accion` (`accion`),
    INDEX `idx_auditoria_entidad` (`entidad_afectada`, `registro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
