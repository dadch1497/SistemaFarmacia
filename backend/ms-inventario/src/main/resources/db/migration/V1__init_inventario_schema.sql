-- =====================================================================
-- FarmaGest — ms-inventario: Migración V1 (Esquema inicial)
-- Base de datos: db_inventario
-- =====================================================================

CREATE TABLE IF NOT EXISTS producto_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    sucursal_id INT NOT NULL DEFAULT 1,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 10,
    stock_maximo INT DEFAULT 100,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_producto_sucursal UNIQUE (producto_id, sucursal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lote (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    sucursal_id INT NOT NULL DEFAULT 1,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lote_fefo (producto_id, sucursal_id, estado, fecha_vencimiento ASC),
    INDEX idx_lote_vencimiento (fecha_vencimiento ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS movimiento_kardex (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    lote_id BIGINT NULL,
    sucursal_id INT NOT NULL DEFAULT 1,
    tipo_movimiento VARCHAR(30) NOT NULL,
    cantidad INT NOT NULL,
    saldo_resultante INT NOT NULL,
    referencia_tipo VARCHAR(30) NULL,
    referencia_id VARCHAR(50) NULL,
    motivo VARCHAR(255) NULL,
    usuario_id BIGINT NOT NULL,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kardex_producto (producto_id, fecha_hora DESC),
    CONSTRAINT fk_kardex_lote FOREIGN KEY (lote_id) REFERENCES lote(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerta_inventario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    lote_id BIGINT NULL,
    sucursal_id INT NOT NULL DEFAULT 1,
    tipo_alerta VARCHAR(40) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    nivel_urgencia INT NOT NULL DEFAULT 1,
    atendida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_alerta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alerta_urgencia (atendida, nivel_urgencia DESC),
    CONSTRAINT fk_alerta_lote FOREIGN KEY (lote_id) REFERENCES lote(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
