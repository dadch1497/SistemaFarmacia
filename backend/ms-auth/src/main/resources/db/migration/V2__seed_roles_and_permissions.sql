-- V2: Semilla de roles y permisos del sistema FarmaGest

INSERT INTO `rol` (`id`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'ROLE_ADMINISTRADOR', 'Administrador con acceso total operativo y financiero', TRUE),
(2, 'ROLE_VENDEDOR', 'Vendedor de mostrador y punto de venta POS', TRUE),
(3, 'ROLE_ALMACENERO', 'Almacenero y responsable de ingresos físicos e inventario', TRUE)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `permiso` (`id`, `codigo`, `descripcion`, `modulo`) VALUES
-- POS y Ventas
(1, 'VENTA_CREAR', 'Emitir ventas en el Punto de Venta POS', 'POS'),
(2, 'VENTA_LISTAR_PROPIAS', 'Consultar el historial de ventas propias', 'POS'),
(3, 'VENTA_LISTAR_TODAS', 'Consultar las ventas de todos los vendedores', 'POS'),
(4, 'VENTA_ANULAR', 'Anular ventas y reintegrar stock', 'POS'),
(5, 'VENTA_DEVOLUCION', 'Registrar devoluciones de clientes', 'POS'),
(6, 'CUPON_APLICAR', 'Aplicar cupones de descuento vigentes', 'POS'),
(7, 'DESCUENTO_AUTORIZAR', 'Autorizar descuentos comerciales superiores al 5%', 'POS'),

-- Caja
(8, 'CAJA_APERTURA', 'Abrir turno de caja', 'CAJA'),
(9, 'CAJA_CIERRE_PROPIO', 'Cerrar y arquear su propio turno de caja', 'CAJA'),
(10, 'CAJA_CIERRE_TODOS', 'Cerrar y auditar cajas de cualquier vendedor', 'CAJA'),

-- Catálogo
(11, 'PRODUCTO_CONSULTAR', 'Consultar catálogo de productos y precios al público', 'CATALOGO'),
(12, 'PRODUCTO_CREAR', 'Registrar nuevos productos farmacéuticos', 'CATALOGO'),
(13, 'PRODUCTO_EDITAR', 'Modificar datos de productos existentes', 'CATALOGO'),
(14, 'PRODUCTO_PRECIO_CAMBIAR', 'Cambiar precio de venta de productos', 'CATALOGO'),
(15, 'COSTO_VER', 'Visualizar costos de adquisición y márgenes comerciales', 'CATALOGO'),

-- Inventario
(16, 'STOCK_CONSULTAR', 'Consultar existencias de stock disponible', 'INVENTARIO'),
(17, 'STOCK_AJUSTAR', 'Registrar mermas, roturas y ajustes de inventario', 'INVENTARIO'),
(18, 'ALERTA_VENCIMIENTO_VER', 'Visualizar alertas de vencimiento y stock bajo', 'INVENTARIO'),
(19, 'KARDEX_CONSULTAR', 'Consultar trazabilidad de movimientos Kardex', 'INVENTARIO'),

-- Compras
(20, 'PROVEEDOR_GESTIONAR', 'Registrar y editar proveedores farmacéuticos', 'COMPRAS'),
(21, 'ORDEN_COMPRA_GESTIONAR', 'Crear y autorizar órdenes de compra', 'COMPRAS'),
(22, 'MERCADERIA_INGRESAR', 'Registrar ingreso físico de mercadería por lote', 'COMPRAS'),

-- Clientes
(23, 'CLIENTE_GESTIONAR', 'Registrar y consultar clientes', 'CLIENTES'),

-- Promociones
(24, 'PROMOCION_GESTIONAR', 'Crear y configurar promociones y cupones', 'PROMOCIONES'),

-- Reportes
(25, 'DASHBOARD_VER', 'Visualizar indicadores y tableros gerenciales', 'REPORTES'),
(26, 'REPORTES_VENTAS_VER', 'Consultar reportes de ventas y márgenes', 'REPORTES'),
(27, 'REPORTES_INVENTARIO_VER', 'Consultar reportes de stock y rotación', 'REPORTES'),
(28, 'AUDITORIA_VER', 'Consultar registro de auditoría del sistema', 'REPORTES'),

-- Administración
(29, 'USUARIO_GESTIONAR', 'Administrar cuentas de usuarios y contraseñas', 'SEGURIDAD'),
(30, 'ROL_GESTIONAR', 'Gestionar roles y permisos del sistema', 'SEGURIDAD')
ON DUPLICATE KEY UPDATE `codigo` = VALUES(`codigo`);

-- Asignación de permisos al ADMINISTRADOR (Todos los permisos: 1 al 30)
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`)
SELECT 1, id FROM `permiso`
ON DUPLICATE KEY UPDATE `rol_id` = VALUES(`rol_id`);

-- Asignación de permisos al VENDEDOR
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(2, 1),   -- VENTA_CREAR
(2, 2),   -- VENTA_LISTAR_PROPIAS
(2, 6),   -- CUPON_APLICAR
(2, 8),   -- CAJA_APERTURA
(2, 9),   -- CAJA_CIERRE_PROPIO
(2, 11),  -- PRODUCTO_CONSULTAR (sin costos)
(2, 16),  -- STOCK_CONSULTAR
(2, 18),  -- ALERTA_VENCIMIENTO_VER (solo lectura)
(2, 23)   -- CLIENTE_GESTIONAR
ON DUPLICATE KEY UPDATE `rol_id` = VALUES(`rol_id`);

-- Asignación de permisos al ALMACENERO
INSERT INTO `rol_permiso` (`rol_id`, `permiso_id`) VALUES
(3, 11),  -- PRODUCTO_CONSULTAR
(3, 16),  -- STOCK_CONSULTAR
(3, 17),  -- STOCK_AJUSTAR
(3, 18),  -- ALERTA_VENCIMIENTO_VER
(3, 19),  -- KARDEX_CONSULTAR
(3, 22),  -- MERCADERIA_INGRESAR
(3, 27)   -- REPORTES_INVENTARIO_VER
ON DUPLICATE KEY UPDATE `rol_id` = VALUES(`rol_id`);
