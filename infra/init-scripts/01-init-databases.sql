-- =====================================================================
-- FarmaGest — Script de inicialización de bases de datos independientes
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `db_auth` 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `db_catalogo` 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `db_inventario` 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `db_compras` 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `db_ventas` 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `db_reportes` 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Asignación de privilegios al usuario de la aplicación
GRANT ALL PRIVILEGES ON `db_auth`.* TO 'farmagest_user'@'%';
GRANT ALL PRIVILEGES ON `db_catalogo`.* TO 'farmagest_user'@'%';
GRANT ALL PRIVILEGES ON `db_inventario`.* TO 'farmagest_user'@'%';
GRANT ALL PRIVILEGES ON `db_compras`.* TO 'farmagest_user'@'%';
GRANT ALL PRIVILEGES ON `db_ventas`.* TO 'farmagest_user'@'%';
GRANT ALL PRIVILEGES ON `db_reportes`.* TO 'farmagest_user'@'%';

FLUSH PRIVILEGES;
