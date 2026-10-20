-- =====================================================================
-- FarmaGest — ms-compras: Migración V1 (Esquema inicial)
-- Base de datos: db_compras
-- =====================================================================

CREATE TABLE IF NOT EXISTS proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL,
    razon_social VARCHAR(150) NOT NULL,
    nombre_contacto VARCHAR(100) NULL,
    telefono VARCHAR(30) NULL,
    email VARCHAR(100) NULL,
    direccion VARCHAR(200) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_proveedor_ruc UNIQUE (ruc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orden_compra (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_orden VARCHAR(30) NOT NULL,
    proveedor_id INT NOT NULL,
    sucursal_id INT NOT NULL DEFAULT 1,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    igv DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    usuario_creador_id BIGINT NOT NULL,
    fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_esperada DATE NULL,
    observaciones TEXT NULL,
    CONSTRAINT uk_orden_compra_numero UNIQUE (numero_orden),
    CONSTRAINT fk_orden_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detalle_orden_compra (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    orden_compra_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad_solicitada INT NOT NULL,
    costo_pactado DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_orden FOREIGN KEY (orden_compra_id) REFERENCES orden_compra(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ingreso_mercaderia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_guia VARCHAR(50) NOT NULL,
    numero_factura_proveedor VARCHAR(50) NULL,
    orden_compra_id BIGINT NULL,
    sucursal_id INT NOT NULL DEFAULT 1,
    usuario_recepcion_id BIGINT NOT NULL,
    fecha_recepcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT NULL,
    CONSTRAINT fk_ingreso_orden FOREIGN KEY (orden_compra_id) REFERENCES orden_compra(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detalle_ingreso (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingreso_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_recibida INT NOT NULL,
    costo_unitario_real DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_ingreso FOREIGN KEY (ingreso_id) REFERENCES ingreso_mercaderia(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
