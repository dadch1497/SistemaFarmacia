-- V4: Agregar columnas nombre_producto y codigo_producto a detalle_venta para emision SUNAT
ALTER TABLE `detalle_venta` ADD COLUMN `nombre_producto` VARCHAR(255) NULL;
ALTER TABLE `detalle_venta` ADD COLUMN `codigo_producto` VARCHAR(50) NULL;
