CREATE TABLE conteo_fisico (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, sucursal_id INT NOT NULL, referencia VARCHAR(100) NOT NULL,
 usuario_id BIGINT NOT NULL, creado_en DATETIME(6) NOT NULL, cerrado_en DATETIME(6) NULL,
 estado VARCHAR(20) NOT NULL, marcador BIGINT NOT NULL, revisado_por BIGINT NULL,
 revision VARCHAR(1000) NULL, revisado_en DATETIME(6) NULL, tiene_foto BOOLEAN NOT NULL DEFAULT FALSE,
 INDEX idx_conteo_sucursal(sucursal_id, creado_en)
);
CREATE TABLE conteo_linea (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, conteo_id BIGINT NOT NULL, producto_id BIGINT NOT NULL,
 nombre VARCHAR(150) NULL, codigo VARCHAR(128) NULL, presentacion VARCHAR(150) NULL,
 stock_inicial INT NOT NULL, actualizado_inicial DATETIME(6) NULL,
 cantidad INT NULL, usuario_id BIGINT NULL, contado_en DATETIME(6) NULL,
 observacion VARCHAR(500) NULL, resultado VARCHAR(40) NULL,
 CONSTRAINT fk_conteo_linea FOREIGN KEY(conteo_id) REFERENCES conteo_fisico(id),
 UNIQUE KEY uk_conteo_producto(conteo_id,producto_id)
);
CREATE TABLE conteo_evento (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, conteo_id BIGINT NOT NULL, usuario_id BIGINT NOT NULL,
 fecha DATETIME(6) NOT NULL, accion VARCHAR(30) NOT NULL, detalle VARCHAR(1000) NOT NULL,
 CONSTRAINT fk_conteo_evento FOREIGN KEY(conteo_id) REFERENCES conteo_fisico(id)
);
CREATE TABLE conteo_foto (
 id BIGINT PRIMARY KEY, contenido LONGBLOB NOT NULL, tipo VARCHAR(30) NOT NULL,
 CONSTRAINT fk_conteo_foto FOREIGN KEY(id) REFERENCES conteo_fisico(id)
);
