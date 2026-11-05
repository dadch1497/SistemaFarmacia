-- V3: Agregar columnas para soporte de notas de credito electronicas SUNAT y trazabilidad de devoluciones
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `serie_nota_credito` VARCHAR(10) NULL;
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `numero_nota_credito` VARCHAR(20) NULL;
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `tipo_nota_credito` VARCHAR(10) DEFAULT '07';
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `descripcion_tipo_nc` VARCHAR(100) DEFAULT 'Devolución por ítem';
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `subtotal_devuelto` DECIMAL(10,2) NULL;
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `igv_devuelto` DECIMAL(10,2) NULL;
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `medio_reembolso` VARCHAR(30) NULL;
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `hash_cpe` VARCHAR(100) NULL;
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `qr_code_url` VARCHAR(500) NULL;
ALTER TABLE `devolucion` ADD COLUMN IF NOT EXISTS `estado_sunat` VARCHAR(30) DEFAULT 'ACEPTADA';

ALTER TABLE `detalle_devolucion` ADD COLUMN IF NOT EXISTS `nombre_producto` VARCHAR(255) NULL;
ALTER TABLE `detalle_devolucion` ADD COLUMN IF NOT EXISTS `numero_lote` VARCHAR(50) NULL;
ALTER TABLE `detalle_devolucion` ADD COLUMN IF NOT EXISTS `precio_unitario` DECIMAL(10,2) NULL;
ALTER TABLE `detalle_devolucion` ADD COLUMN IF NOT EXISTS `reingresa_a_stock` TINYINT(1) DEFAULT 1;
