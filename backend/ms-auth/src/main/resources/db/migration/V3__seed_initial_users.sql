-- V3: Inserción de los 4 usuarios iniciales de FarmaGest
-- Las contraseñas se sincronizan y hashean dinámicamente mediante DataInitializer
-- leyendo las variables de entorno: INITIAL_ADMIN_PASSWORD, INITIAL_VENDEDOR1_PASSWORD, etc.

INSERT INTO `usuario` (`id`, `username`, `password_hash`, `nombres`, `apellidos`, `email`, `sucursal_id`, `activo`) VALUES
(1, 'admin', '$2a$12$PLACEHOLDER_UPDATED_BY_DATA_INITIALIZER_AT_BOOT', 'Administrador', 'Farma Ochenta', 'admin@farmaochenta.pe', 1, TRUE),
(2, 'vendedor1', '$2a$12$PLACEHOLDER_UPDATED_BY_DATA_INITIALIZER_AT_BOOT', 'Carlos', 'Gómez Soto', 'carlos.gomez@farmaochenta.pe', 1, TRUE),
(3, 'vendedor2', '$2a$12$PLACEHOLDER_UPDATED_BY_DATA_INITIALIZER_AT_BOOT', 'Lucía', 'Morales Rivas', 'lucia.morales@farmaochenta.pe', 1, TRUE),
(4, 'almacenero', '$2a$12$PLACEHOLDER_UPDATED_BY_DATA_INITIALIZER_AT_BOOT', 'Roberto', 'Quispe Tello', 'roberto.quispe@farmaochenta.pe', 1, TRUE)
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

INSERT INTO `usuario_rol` (`usuario_id`, `rol_id`) VALUES
(1, 1), -- admin -> ROLE_ADMINISTRADOR
(2, 2), -- vendedor1 -> ROLE_VENDEDOR
(3, 2), -- vendedor2 -> ROLE_VENDEDOR
(4, 3)  -- almacenero -> ROLE_ALMACENERO
ON DUPLICATE KEY UPDATE `usuario_id` = VALUES(`usuario_id`);
