-- =====================================================================
-- FarmaGest — Migración V3: Limpieza de datos demo para reflejar solo ventas reales
-- Base de datos: db_reportes
-- =====================================================================

DELETE FROM `resumen_venta_diaria`;
DELETE FROM `metrica_producto_diaria`;
DELETE FROM `metrica_vendedor_diaria`;
DELETE FROM `metrica_pago_diaria`;
