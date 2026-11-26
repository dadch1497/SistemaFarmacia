-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: db_auth
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `db_auth`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_auth` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_auth`;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init auth schema','SQL','V1__init_auth_schema.sql',1712003648,'farmagest_user','2026-11-05 06:32:58',853,1),(2,'2','seed roles and permissions','SQL','V2__seed_roles_and_permissions.sql',180413103,'farmagest_user','2026-11-05 06:32:58',81,1),(3,'3','seed initial users','SQL','V3__seed_initial_users.sql',836539006,'farmagest_user','2026-11-05 06:32:58',31,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permiso`
--

DROP TABLE IF EXISTS `permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permiso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modulo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_permiso_modulo` (`modulo`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permiso`
--

LOCK TABLES `permiso` WRITE;
/*!40000 ALTER TABLE `permiso` DISABLE KEYS */;
INSERT INTO `permiso` VALUES (1,'VENTA_CREAR','Emitir ventas en el Punto de Venta POS','POS'),(2,'VENTA_LISTAR_PROPIAS','Consultar el historial de ventas propias','POS'),(3,'VENTA_LISTAR_TODAS','Consultar las ventas de todos los vendedores','POS'),(4,'VENTA_ANULAR','Anular ventas y reintegrar stock','POS'),(5,'VENTA_DEVOLUCION','Registrar devoluciones de clientes','POS'),(6,'CUPON_APLICAR','Aplicar cupones de descuento vigentes','POS'),(7,'DESCUENTO_AUTORIZAR','Autorizar descuentos comerciales superiores al 5%','POS'),(8,'CAJA_APERTURA','Abrir turno de caja','CAJA'),(9,'CAJA_CIERRE_PROPIO','Cerrar y arquear su propio turno de caja','CAJA'),(10,'CAJA_CIERRE_TODOS','Cerrar y auditar cajas de cualquier vendedor','CAJA'),(11,'PRODUCTO_CONSULTAR','Consultar catÃ¡logo de productos y precios al pÃºblico','CATALOGO'),(12,'PRODUCTO_CREAR','Registrar nuevos productos farmacÃ©uticos','CATALOGO'),(13,'PRODUCTO_EDITAR','Modificar datos de productos existentes','CATALOGO'),(14,'PRODUCTO_PRECIO_CAMBIAR','Cambiar precio de venta de productos','CATALOGO'),(15,'COSTO_VER','Visualizar costos de adquisiciÃ³n y mÃ¡rgenes comerciales','CATALOGO'),(16,'STOCK_CONSULTAR','Consultar existencias de stock disponible','INVENTARIO'),(17,'STOCK_AJUSTAR','Registrar mermas, roturas y ajustes de inventario','INVENTARIO'),(18,'ALERTA_VENCIMIENTO_VER','Visualizar alertas de vencimiento y stock bajo','INVENTARIO'),(19,'KARDEX_CONSULTAR','Consultar trazabilidad de movimientos Kardex','INVENTARIO'),(20,'PROVEEDOR_GESTIONAR','Registrar y editar proveedores farmacÃ©uticos','COMPRAS'),(21,'ORDEN_COMPRA_GESTIONAR','Crear y autorizar Ã³rdenes de compra','COMPRAS'),(22,'MERCADERIA_INGRESAR','Registrar ingreso fÃ­sico de mercaderÃ­a por lote','COMPRAS'),(23,'CLIENTE_GESTIONAR','Registrar y consultar clientes','CLIENTES'),(24,'PROMOCION_GESTIONAR','Crear y configurar promociones y cupones','PROMOCIONES'),(25,'DASHBOARD_VER','Visualizar indicadores y tableros gerenciales','REPORTES'),(26,'REPORTES_VENTAS_VER','Consultar reportes de ventas y mÃ¡rgenes','REPORTES'),(27,'REPORTES_INVENTARIO_VER','Consultar reportes de stock y rotaciÃ³n','REPORTES'),(28,'AUDITORIA_VER','Consultar registro de auditorÃ­a del sistema','REPORTES'),(29,'USUARIO_GESTIONAR','Administrar cuentas de usuarios y contraseÃ±as','SEGURIDAD'),(30,'ROL_GESTIONAR','Gestionar roles y permisos del sistema','SEGURIDAD');
/*!40000 ALTER TABLE `permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'ROLE_ADMINISTRADOR','Administrador con acceso total operativo y financiero',1),(2,'ROLE_VENDEDOR','Vendedor de mostrador y punto de venta POS',1),(3,'ROLE_ALMACENERO','Almacenero y responsable de ingresos fÃ­sicos e inventario',1);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `rol_id` int NOT NULL,
  `permiso_id` int NOT NULL,
  PRIMARY KEY (`rol_id`,`permiso_id`),
  KEY `fk_rol_permiso_permiso` (`permiso_id`),
  CONSTRAINT `fk_rol_permiso_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permiso` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rol_permiso_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
INSERT INTO `rol_permiso` VALUES (1,1),(2,1),(1,2),(2,2),(1,3),(1,4),(1,5),(1,6),(2,6),(1,7),(1,8),(2,8),(1,9),(2,9),(1,10),(1,11),(2,11),(3,11),(1,12),(1,13),(1,14),(1,15),(1,16),(2,16),(3,16),(1,17),(3,17),(1,18),(2,18),(3,18),(1,19),(3,19),(1,20),(1,21),(1,22),(3,22),(1,23),(2,23),(1,24),(1,25),(1,26),(1,27),(3,27),(1,28),(1,29),(1,30);
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuario_sucursal` (`sucursal_id`),
  KEY `idx_usuario_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'admin','$2a$12$W5/kwmadNcYljLqm504tE.Yf.l3shxGicLDn4CkbDqhA3eHFyBSDC','Administrador','Farma Ochenta','admin@farmaochenta.pe',1,1,'2026-11-05 06:32:58','2026-11-19 23:33:25'),(2,'vendedor1','$2a$12$aHdeAIO/Z1FI9VU1H9Cj7eIjY2JXK0s06DdVu37Zn1Qnx2qUSthfq','Carlos','GÃ³mez Soto','carlos.gomez@farmaochenta.pe',1,1,'2026-11-05 06:32:58','2026-11-19 23:33:26'),(3,'vendedor2','$2a$12$j2FEb.yhUDHWHhC3yjMISe3Tjh2fgKpOzfTtOinZhiz.Rbw2mVjba','LucÃ­a','Morales Rivas','lucia.morales@farmaochenta.pe',1,1,'2026-11-05 06:32:58','2026-11-19 23:36:19'),(4,'almacenero','$2a$12$h6btPV0W3nQ303Lwxj/gkOyBtfvi6SsveywmAGnLO7hMEhoXosVxK','Roberto','Quispe Tello','roberto.quispe@farmaochenta.pe',1,1,'2026-11-05 06:32:58','2026-11-19 23:33:27');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `usuario_id` bigint NOT NULL,
  `rol_id` int NOT NULL,
  PRIMARY KEY (`usuario_id`,`rol_id`),
  KEY `fk_usuario_rol_rol` (`rol_id`),
  CONSTRAINT `fk_usuario_rol_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usuario_rol_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
INSERT INTO `usuario_rol` VALUES (1,1),(2,2),(3,2),(4,3);
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `db_catalogo`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_catalogo` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_catalogo`;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_categoria_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'AnalgÃ©sicos','Medicamentos para el alivio del dolor y fiebre',1),(2,'AntibiÃ³ticos','FÃ¡rmacos para combatir infecciones bacterianas',1),(3,'AntialÃ©rgicos','AntihistamÃ­nicos para alergias respiratorias y dÃ©rmicas',1),(4,'Gastrointestinal','Protectores gÃ¡stricos, antiÃ¡cidos y digestivos',1),(5,'Vitaminas','Suplementos nutricionales y multivitamÃ­nicos',1),(6,'Cuidado personal','Higiene, antisÃ©pticos y primeros auxilios',1);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init catalogo schema','SQL','V1__init_catalogo_schema.sql',-869308978,'farmagest_user','2026-11-05 06:32:58',793,1),(2,'2','seed categorias laboratorios','SQL','V2__seed_categorias_laboratorios.sql',456625197,'farmagest_user','2026-11-05 06:32:58',37,1),(3,'3','seed productos ejemplo','SQL','V3__seed_productos_ejemplo.sql',-1756247938,'farmagest_user','2026-11-05 06:32:59',17,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_precio`
--

DROP TABLE IF EXISTS `historial_precio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_precio` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `producto_id` bigint NOT NULL,
  `precio_anterior` decimal(10,2) NOT NULL,
  `precio_nuevo` decimal(10,2) NOT NULL,
  `costo_anterior` decimal(10,2) NOT NULL,
  `costo_nuevo` decimal(10,2) NOT NULL,
  `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_id` bigint NOT NULL,
  `fecha_cambio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_historial_producto` (`producto_id`),
  KEY `idx_historial_fecha` (`fecha_cambio`),
  CONSTRAINT `fk_historial_producto` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_precio`
--

LOCK TABLES `historial_precio` WRITE;
/*!40000 ALTER TABLE `historial_precio` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_precio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratorio`
--

DROP TABLE IF EXISTS `laboratorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratorio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pais_origen` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_laboratorio_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratorio`
--

LOCK TABLES `laboratorio` WRITE;
/*!40000 ALTER TABLE `laboratorio` DISABLE KEYS */;
INSERT INTO `laboratorio` VALUES (1,'Medifarma','PerÃº',1),(2,'Laboratorios Portugal','PerÃº',1),(3,'IQ Farma','PerÃº',1),(4,'Bayer','Alemania',1),(5,'Pfizer','Estados Unidos',1),(6,'Farmindustria','PerÃº',1);
/*!40000 ALTER TABLE `laboratorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo_barras` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `principio_activo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `concentracion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria_id` int NOT NULL,
  `laboratorio_id` int NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `precio_costo` decimal(10,2) NOT NULL,
  `requiere_receta` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_barras` (`codigo_barras`),
  KEY `fk_producto_laboratorio` (`laboratorio_id`),
  KEY `idx_producto_nombre` (`nombre`),
  KEY `idx_producto_codigo` (`codigo_barras`),
  KEY `idx_producto_categoria` (`categoria_id`),
  KEY `idx_producto_activo` (`activo`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`),
  CONSTRAINT `fk_producto_laboratorio` FOREIGN KEY (`laboratorio_id`) REFERENCES `laboratorio` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'7751234567890','Paracetamol 500 mg','Paracetamol','500 mg','Tableta',1,2,0.50,0.22,0,1,'2026-11-05 06:32:59',NULL),(2,'7751234567891','Ibuprofeno 400 mg','Ibuprofeno','400 mg','Tableta',1,1,0.90,0.40,0,1,'2026-11-05 06:32:59',NULL),(3,'7751234567892','Amoxicilina 500 mg','Amoxicilina','500 mg','CÃ¡psula',2,6,2.50,1.20,1,1,'2026-11-05 06:32:59',NULL),(4,'7751234567893','Loratadina 10 mg','Loratadina','10 mg','Tableta',3,2,0.70,0.30,0,1,'2026-11-05 06:32:59',NULL),(5,'7751234567894','Omeprazol 20 mg','Omeprazol','20 mg','CÃ¡psula',4,3,1.50,0.65,0,1,'2026-11-05 06:32:59',NULL),(6,'7751234567895','Vitamina C 1 g','Ãcido AscÃ³rbico','1 g','Tableta efervescente',5,4,2.00,0.90,0,1,'2026-11-05 06:32:59',NULL),(7,'7751234567896','Alcohol 70Â° 250 ml','Alcohol EtÃ­lico 70Â°','70Â°','Frasco 250 ml',6,2,6.00,3.80,0,1,'2026-11-05 06:32:59',NULL);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `db_compras`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_compras` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_compras`;

--
-- Table structure for table `detalle_ingreso`
--

DROP TABLE IF EXISTS `detalle_ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ingreso` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ingreso_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  `numero_lote` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `cantidad_recibida` int NOT NULL,
  `costo_unitario_real` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_detalle_ingreso` (`ingreso_id`),
  CONSTRAINT `fk_detalle_ingreso` FOREIGN KEY (`ingreso_id`) REFERENCES `ingreso_mercaderia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ingreso`
--

LOCK TABLES `detalle_ingreso` WRITE;
/*!40000 ALTER TABLE `detalle_ingreso` DISABLE KEYS */;
INSERT INTO `detalle_ingreso` VALUES (1,1,3,'Lote-05','2027-10-12',100,0.28),(2,1,2,'Lote-04','2027-07-08',65,1.10),(3,2,7,'Lote-1415','2027-06-22',5,5.00),(4,3,6,'50','2027-07-28',5,1.00);
/*!40000 ALTER TABLE `detalle_ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_orden_compra`
--

DROP TABLE IF EXISTS `detalle_orden_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_orden_compra` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `orden_compra_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  `cantidad_solicitada` int NOT NULL,
  `costo_pactado` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_detalle_orden` (`orden_compra_id`),
  CONSTRAINT `fk_detalle_orden` FOREIGN KEY (`orden_compra_id`) REFERENCES `orden_compra` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_orden_compra`
--

LOCK TABLES `detalle_orden_compra` WRITE;
/*!40000 ALTER TABLE `detalle_orden_compra` DISABLE KEYS */;
INSERT INTO `detalle_orden_compra` VALUES (1,1,3,100,0.28,28.00),(2,1,2,65,1.10,71.50),(3,2,7,10,5.00,50.00),(4,3,6,10,1.00,10.00);
/*!40000 ALTER TABLE `detalle_orden_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init compras schema','SQL','V1__init_compras_schema.sql',-1845212625,'farmagest_user','2026-11-05 06:33:01',481,1),(2,'2','seed proveedores ordenes','SQL','V2__seed_proveedores_ordenes.sql',1064844119,'farmagest_user','2026-11-05 06:33:01',52,1),(3,'3','guia documento','SQL','V3__guia_documento.sql',993080067,'farmagest_user','2026-11-05 06:33:01',101,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guia_documento`
--

DROP TABLE IF EXISTS `guia_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guia_documento` (
  `ingreso_id` bigint NOT NULL,
  `nombre` varchar(180) NOT NULL,
  `tipo` varchar(40) NOT NULL,
  `contenido` mediumblob NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ingreso_id`),
  CONSTRAINT `fk_guia_ingreso` FOREIGN KEY (`ingreso_id`) REFERENCES `ingreso_mercaderia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guia_documento`
--

LOCK TABLES `guia_documento` WRITE;
/*!40000 ALTER TABLE `guia_documento` DISABLE KEYS */;
/*!40000 ALTER TABLE `guia_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingreso_mercaderia`
--

DROP TABLE IF EXISTS `ingreso_mercaderia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingreso_mercaderia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `numero_guia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_factura_proveedor` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden_compra_id` bigint DEFAULT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `usuario_recepcion_id` bigint NOT NULL,
  `fecha_recepcion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `fk_ingreso_orden` (`orden_compra_id`),
  CONSTRAINT `fk_ingreso_orden` FOREIGN KEY (`orden_compra_id`) REFERENCES `orden_compra` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingreso_mercaderia`
--

LOCK TABLES `ingreso_mercaderia` WRITE;
/*!40000 ALTER TABLE `ingreso_mercaderia` DISABLE KEYS */;
INSERT INTO `ingreso_mercaderia` VALUES (1,'GR01-000001','F001-0280',1,1,1,'2026-11-08 12:13:37','Recepcion Aprobada'),(2,'GR01','F001-1814',2,1,1,'2026-11-22 12:19:53','RecepciÃ³n fÃ­sica correspondiente a la Orden OC-783345'),(3,'GR01-2009','F001-1014',3,1,4,'2026-11-26 04:43:28','RecepciÃ³n fÃ­sica correspondiente a la Orden OC-305266 | [ALERTA: Lote incompleto - Faltan: Vitamina C 1 g (-5 un.)]');
/*!40000 ALTER TABLE `ingreso_mercaderia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden_compra`
--

DROP TABLE IF EXISTS `orden_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden_compra` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `numero_orden` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `proveedor_id` int NOT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `igv` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `usuario_creador_id` bigint NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_esperada` date DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_orden_compra_numero` (`numero_orden`),
  KEY `fk_orden_proveedor` (`proveedor_id`),
  CONSTRAINT `fk_orden_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_compra`
--

LOCK TABLES `orden_compra` WRITE;
/*!40000 ALTER TABLE `orden_compra` DISABLE KEYS */;
INSERT INTO `orden_compra` VALUES (1,'OC-2026-0001',1,1,'RECIBIDA_TOTAL',100.00,18.00,118.00,1,'2026-11-05 06:33:01','2026-11-08','ReposiciÃ³n urgente de stock de seguridad para Ate'),(2,'OC-783345',2,1,'RECIBIDA_TOTAL',50.00,9.00,59.00,1,'2026-11-22 12:16:23',NULL,'Entrega Prioritaria'),(3,'OC-305266',2,1,'RECIBIDA_PARCIAL',10.00,1.80,11.80,1,'2026-11-26 04:11:45',NULL,'Entrega prioritaria');
/*!40000 ALTER TABLE `orden_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruc` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_contacto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_proveedor_ruc` (`ruc`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'20100055230','DroguerÃ­a Los Andes S.A.C.','Juan PÃ©rez','01-456-7890','ventas@droguerialosandes.pe','Av. Elmer Faucett 1920, Callao',1,'2026-11-05 06:33:01'),(2,'20549812401','Distribuidora FarmacÃ©utica del PerÃº S.A.','MarÃ­a Rojas','01-321-6540','pedidos@difarpe.com.pe','Av. Venezuela 2400, Lima',1,'2026-11-05 06:33:01'),(3,'20489123091','Consorcio MÃ©dico QuirÃºrgico S.R.L.','Carlos Mendoza','01-789-1234','contacto@consorciomedico.pe','Av. Javier Prado Este 4500, Ate',1,'2026-11-05 06:33:01');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `db_inventario`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_inventario` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_inventario`;

--
-- Table structure for table `alerta_inventario`
--

DROP TABLE IF EXISTS `alerta_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerta_inventario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `producto_id` bigint NOT NULL,
  `lote_id` bigint DEFAULT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `tipo_alerta` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel_urgencia` int NOT NULL DEFAULT '1',
  `atendida` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_alerta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_alerta_urgencia` (`atendida`,`nivel_urgencia` DESC),
  KEY `fk_alerta_lote` (`lote_id`),
  CONSTRAINT `fk_alerta_lote` FOREIGN KEY (`lote_id`) REFERENCES `lote` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerta_inventario`
--

LOCK TABLES `alerta_inventario` WRITE;
/*!40000 ALTER TABLE `alerta_inventario` DISABLE KEYS */;
INSERT INTO `alerta_inventario` VALUES (1,2,2,1,'VENCIMIENTO_30_DIAS','Lote L-2024-AMX1 de Amoxicilina 500 mg vence en menos de 30 dÃ­as (CrÃ­tico FEFO)',3,0,'2026-11-05 06:33:01'),(2,3,4,1,'STOCK_MINIMO','Stock de Ibuprofeno 400 mg (8 un.) estÃ¡ por debajo del mÃ­nimo de seguridad (20 un.)',2,0,'2026-11-05 06:33:01'),(3,3,4,1,'VENCIMIENTO_60_DIAS','Lote L-2024-IBU de Ibuprofeno 400 mg vence en 45 dÃ­as',2,0,'2026-11-05 06:33:01');
/*!40000 ALTER TABLE `alerta_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conteo_evento`
--

DROP TABLE IF EXISTS `conteo_evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conteo_evento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conteo_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `accion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalle` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_conteo_evento` (`conteo_id`),
  CONSTRAINT `fk_conteo_evento` FOREIGN KEY (`conteo_id`) REFERENCES `conteo_fisico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conteo_evento`
--

LOCK TABLES `conteo_evento` WRITE;
/*!40000 ALTER TABLE `conteo_evento` DISABLE KEYS */;
/*!40000 ALTER TABLE `conteo_evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conteo_fisico`
--

DROP TABLE IF EXISTS `conteo_fisico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conteo_fisico` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL,
  `referencia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` bigint NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  `cerrado_en` datetime(6) DEFAULT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `marcador` bigint NOT NULL,
  `revisado_por` bigint DEFAULT NULL,
  `revision` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revisado_en` datetime(6) DEFAULT NULL,
  `tiene_foto` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_conteo_sucursal` (`sucursal_id`,`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conteo_fisico`
--

LOCK TABLES `conteo_fisico` WRITE;
/*!40000 ALTER TABLE `conteo_fisico` DISABLE KEYS */;
/*!40000 ALTER TABLE `conteo_fisico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conteo_foto`
--

DROP TABLE IF EXISTS `conteo_foto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conteo_foto` (
  `id` bigint NOT NULL,
  `contenido` longblob NOT NULL,
  `tipo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_conteo_foto` FOREIGN KEY (`id`) REFERENCES `conteo_fisico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conteo_foto`
--

LOCK TABLES `conteo_foto` WRITE;
/*!40000 ALTER TABLE `conteo_foto` DISABLE KEYS */;
/*!40000 ALTER TABLE `conteo_foto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conteo_linea`
--

DROP TABLE IF EXISTS `conteo_linea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conteo_linea` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conteo_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentacion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_inicial` int NOT NULL,
  `actualizado_inicial` datetime(6) DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `usuario_id` bigint DEFAULT NULL,
  `contado_en` datetime(6) DEFAULT NULL,
  `observacion` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultado` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conteo_producto` (`conteo_id`,`producto_id`),
  CONSTRAINT `fk_conteo_linea` FOREIGN KEY (`conteo_id`) REFERENCES `conteo_fisico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conteo_linea`
--

LOCK TABLES `conteo_linea` WRITE;
/*!40000 ALTER TABLE `conteo_linea` DISABLE KEYS */;
/*!40000 ALTER TABLE `conteo_linea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init inventario schema','SQL','V1__init_inventario_schema.sql',1687664970,'farmagest_user','2026-11-05 06:33:01',497,1),(2,'2','seed stock lotes','SQL','V2__seed_stock_lotes.sql',-1766122531,'farmagest_user','2026-11-05 06:33:01',46,1),(3,'3','costo historico kardex','SQL','V3__costo_historico_kardex.sql',-857506921,'farmagest_user','2026-11-05 06:33:01',198,1),(4,'4','conteo fisico','SQL','V4__conteo_fisico.sql',2071567497,'farmagest_user','2026-11-05 06:33:02',372,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lote`
--

DROP TABLE IF EXISTS `lote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lote` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `producto_id` bigint NOT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `numero_lote` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `cantidad_inicial` int NOT NULL,
  `cantidad_actual` int NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DISPONIBLE',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lote_fefo` (`producto_id`,`sucursal_id`,`estado`,`fecha_vencimiento`),
  KEY `idx_lote_vencimiento` (`fecha_vencimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lote`
--

LOCK TABLES `lote` WRITE;
/*!40000 ALTER TABLE `lote` DISABLE KEYS */;
INSERT INTO `lote` VALUES (1,1,1,'L-2024-ALC','2027-07-03',50,48,3.80,'DISPONIBLE','2026-11-05 06:33:01'),(2,2,1,'L-2024-AMX1','2026-11-25',30,28,1.10,'DISPONIBLE','2026-11-05 06:33:01'),(3,2,1,'L-2025-AMX2','2027-05-04',50,50,1.10,'DISPONIBLE','2026-11-05 06:33:01'),(4,3,1,'L-2024-IBU','2026-12-20',50,7,0.28,'DISPONIBLE','2026-11-05 06:33:01'),(5,4,1,'L-2025-OME','2027-11-05',120,118,0.65,'DISPONIBLE','2026-11-05 06:33:01'),(6,5,1,'L-2024-CET','2027-01-19',40,40,0.40,'DISPONIBLE','2026-11-05 06:33:01'),(7,6,1,'L-2025-LOS','2027-09-01',60,60,0.50,'DISPONIBLE','2026-11-05 06:33:01'),(8,7,1,'L-2026-JER','2028-10-25',200,200,0.55,'DISPONIBLE','2026-11-05 06:33:01'),(9,3,1,'Lote-05','2027-10-12',100,100,0.28,'DISPONIBLE','2026-11-08 12:13:38'),(10,2,1,'Lote-04','2027-07-08',65,65,1.10,'DISPONIBLE','2026-11-08 12:13:38'),(11,7,1,'Lote-1415','2027-06-22',5,5,5.00,'DISPONIBLE','2026-11-22 12:19:54'),(12,6,1,'50','2027-07-28',5,5,1.00,'DISPONIBLE','2026-11-26 04:43:28');
/*!40000 ALTER TABLE `lote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_kardex`
--

DROP TABLE IF EXISTS `movimiento_kardex`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_kardex` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `producto_id` bigint NOT NULL,
  `lote_id` bigint DEFAULT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `tipo_movimiento` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `saldo_resultante` int NOT NULL,
  `referencia_tipo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_id` bigint NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `costo_unitario_registrado` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_kardex_producto` (`producto_id`,`fecha_hora` DESC),
  KEY `fk_kardex_lote` (`lote_id`),
  KEY `idx_kardex_sucursal_fecha` (`sucursal_id`,`fecha_hora`),
  CONSTRAINT `fk_kardex_lote` FOREIGN KEY (`lote_id`) REFERENCES `lote` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_kardex`
--

LOCK TABLES `movimiento_kardex` WRITE;
/*!40000 ALTER TABLE `movimiento_kardex` DISABLE KEYS */;
INSERT INTO `movimiento_kardex` VALUES (1,1,1,1,'INGRESO_INICIAL',50,50,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(2,2,2,1,'INGRESO_INICIAL',30,30,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(3,2,3,1,'INGRESO_INICIAL',50,80,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(4,3,4,1,'INGRESO_INICIAL',8,8,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(5,4,5,1,'INGRESO_INICIAL',120,120,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(6,5,6,1,'INGRESO_INICIAL',40,40,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(7,6,7,1,'INGRESO_INICIAL',60,60,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(8,7,8,1,'INGRESO_INICIAL',200,200,'INICIAL','INI-001','Carga inicial de inventario',1,'2026-11-05 06:33:01',NULL),(9,2,2,1,'SALIDA_VENTA',-1,79,'VENTA','B001-00000006','Despacho POS vÃ­a FEFO',1,'2026-11-08 06:42:57',1.10),(10,1,1,1,'SALIDA_VENTA',-1,49,'VENTA','B001-00000007','Despacho POS vÃ­a FEFO',1,'2026-11-08 06:52:38',3.80),(11,3,9,1,'INGRESO_COMPRA',100,108,'COMPRA','GR01-000001','RecepciÃ³n de mercaderÃ­a en almacÃ©n',1,'2026-11-08 12:13:38',0.28),(12,2,10,1,'INGRESO_COMPRA',65,144,'COMPRA','GR01-000001','RecepciÃ³n de mercaderÃ­a en almacÃ©n',1,'2026-11-08 12:13:38',1.10),(13,3,4,1,'SALIDA_VENTA',-1,107,'VENTA','F001-00000001','Despacho POS vÃ­a FEFO',1,'2026-11-13 16:29:18',0.28),(14,2,2,1,'SALIDA_VENTA',-1,143,'VENTA','B001-00000008','Despacho POS vÃ­a FEFO',1,'2026-11-13 17:00:39',1.10),(15,4,5,1,'SALIDA_VENTA',-1,119,'VENTA','B001-00000009','Despacho POS vÃ­a FEFO',1,'2026-11-20 04:00:54',0.65),(16,4,5,1,'SALIDA_VENTA',-1,118,'VENTA','B001-00000010','Despacho POS vÃ­a FEFO',1,'2026-11-22 05:38:18',0.65),(17,7,11,1,'INGRESO_COMPRA',5,205,'COMPRA','GR01','RecepciÃ³n de mercaderÃ­a en almacÃ©n',1,'2026-11-22 12:19:55',5.00),(18,1,1,1,'SALIDA_VENTA',-1,48,'VENTA','B001-00000011','Despacho POS vÃ­a FEFO',1,'2026-11-22 12:22:26',3.80),(19,6,12,1,'INGRESO_COMPRA',5,65,'COMPRA','GR01-2009','RecepciÃ³n de mercaderÃ­a en almacÃ©n',4,'2026-11-26 04:43:29',1.00);
/*!40000 ALTER TABLE `movimiento_kardex` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_stock`
--

DROP TABLE IF EXISTS `producto_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_stock` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `producto_id` bigint NOT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `stock_actual` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '10',
  `stock_maximo` int DEFAULT '100',
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_producto_sucursal` (`producto_id`,`sucursal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_stock`
--

LOCK TABLES `producto_stock` WRITE;
/*!40000 ALTER TABLE `producto_stock` DISABLE KEYS */;
INSERT INTO `producto_stock` VALUES (1,1,1,48,15,150,'2026-11-22 12:22:26'),(2,2,1,143,20,200,'2026-11-13 17:00:39'),(3,3,1,107,20,100,'2026-11-13 16:29:18'),(4,4,1,118,25,300,'2026-11-22 05:38:18'),(5,5,1,40,15,100,'2026-11-05 06:33:01'),(6,6,1,65,20,150,'2026-11-26 04:43:29'),(7,7,1,205,50,500,'2026-11-22 12:19:55');
/*!40000 ALTER TABLE `producto_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `db_reportes`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_reportes` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_reportes`;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init reportes schema','SQL','V1__init_reportes_schema.sql',-1572621885,'farmagest_user','2026-11-05 06:33:02',558,1),(2,'2','seed reportes data','SQL','V2__seed_reportes_data.sql',-1170657279,'farmagest_user','2026-11-05 06:33:02',58,1),(3,'3','clear demo reportes data','SQL','V3__clear_demo_reportes_data.sql',-1720768333,'farmagest_user','2026-11-06 06:50:57',65,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_auditoria`
--

DROP TABLE IF EXISTS `log_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_auditoria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `usuario_id` bigint NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entidad_afectada` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `registro_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_anterior` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `valor_nuevo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_origen` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_auditoria_fecha` (`fecha_hora` DESC),
  KEY `idx_auditoria_accion` (`accion`),
  KEY `idx_auditoria_entidad` (`entidad_afectada`,`registro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_auditoria`
--

LOCK TABLES `log_auditoria` WRITE;
/*!40000 ALTER TABLE `log_auditoria` DISABLE KEYS */;
INSERT INTO `log_auditoria` VALUES (1,1,1,'admin','ROLE_ADMINISTRADOR','CAMBIO_PRECIO','PRODUCTO','1','{\"precioVenta\": 1.20}','{\"precioVenta\": 1.50, \"motivo\": \"Ajuste inflacionario proveedor\"}','127.0.0.1','2026-11-03 06:33:02'),(2,1,1,'admin','ROLE_ADMINISTRADOR','AJUSTE_STOCK','LOTE','LOTE-PARACETAMOL-2027','{\"stockActual\": 105}','{\"stockActual\": 100, \"motivo\": \"Merma por frasco roto en almacÃ©n\"}','127.0.0.1','2026-11-04 06:33:02'),(3,1,1,'admin','ROLE_ADMINISTRADOR','VENTA_ANULADA','VENTA','B001-00000001','{\"estado\": \"COMPLETADA\", \"total\": 6.37}','{\"estado\": \"ANULADA\", \"motivo\": \"Cliente solicitÃ³ cambio de comprobante\"}','127.0.0.1','2026-11-05 03:33:02');
/*!40000 ALTER TABLE `log_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrica_pago_diaria`
--

DROP TABLE IF EXISTS `metrica_pago_diaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metrica_pago_diaria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `fecha` date NOT NULL,
  `medio_pago` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_transacciones` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sucursal_fecha_pago` (`sucursal_id`,`fecha`,`medio_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrica_pago_diaria`
--

LOCK TABLES `metrica_pago_diaria` WRITE;
/*!40000 ALTER TABLE `metrica_pago_diaria` DISABLE KEYS */;
INSERT INTO `metrica_pago_diaria` VALUES (5,1,'2026-11-08','EFECTIVO',1.40,2),(6,1,'2026-11-13','EFECTIVO',3.40,2),(7,1,'2026-11-20','EFECTIVO',0.70,1),(8,1,'2026-11-22','EFECTIVO',1.20,2);
/*!40000 ALTER TABLE `metrica_pago_diaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrica_producto_diaria`
--

DROP TABLE IF EXISTS `metrica_producto_diaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metrica_producto_diaria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `fecha` date NOT NULL,
  `producto_id` bigint NOT NULL,
  `nombre_producto` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidades_vendidas` int NOT NULL DEFAULT '0',
  `monto_vendido` decimal(12,2) NOT NULL DEFAULT '0.00',
  `utilidad_generada` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sucursal_fecha_prod` (`sucursal_id`,`fecha`,`producto_id`),
  KEY `idx_fecha_unidades` (`fecha`,`unidades_vendidas` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrica_producto_diaria`
--

LOCK TABLES `metrica_producto_diaria` WRITE;
/*!40000 ALTER TABLE `metrica_producto_diaria` DISABLE KEYS */;
INSERT INTO `metrica_producto_diaria` VALUES (7,1,'2026-11-08',2,'Producto #2',1,0.90,0.00),(8,1,'2026-11-08',1,'Producto #1',1,0.50,0.00),(9,1,'2026-11-13',3,'Producto #3',1,2.50,0.00),(10,1,'2026-11-13',2,'Producto #2',1,0.90,0.00),(11,1,'2026-11-20',4,'Producto #4',1,0.70,0.00),(12,1,'2026-11-22',4,'Producto #4',1,0.70,0.00),(13,1,'2026-11-22',1,'Producto #1',1,0.50,0.00);
/*!40000 ALTER TABLE `metrica_producto_diaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrica_vendedor_diaria`
--

DROP TABLE IF EXISTS `metrica_vendedor_diaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metrica_vendedor_diaria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `fecha` date NOT NULL,
  `usuario_id` bigint NOT NULL,
  `nombre_vendedor` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_ventas` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sucursal_fecha_vendedor` (`sucursal_id`,`fecha`,`usuario_id`),
  KEY `idx_fecha_monto` (`fecha`,`monto_total` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrica_vendedor_diaria`
--

LOCK TABLES `metrica_vendedor_diaria` WRITE;
/*!40000 ALTER TABLE `metrica_vendedor_diaria` DISABLE KEYS */;
INSERT INTO `metrica_vendedor_diaria` VALUES (4,1,'2026-11-08',1,'Vendedor #1',1.40,2),(5,1,'2026-11-13',1,'Vendedor #1',3.40,2),(6,1,'2026-11-20',1,'Vendedor #1',0.70,1),(7,1,'2026-11-22',1,'Vendedor #1',1.20,2);
/*!40000 ALTER TABLE `metrica_vendedor_diaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resumen_venta_diaria`
--

DROP TABLE IF EXISTS `resumen_venta_diaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumen_venta_diaria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `fecha` date NOT NULL,
  `total_ventas` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_costo` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_utilidad` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cantidad_transacciones` int NOT NULL DEFAULT '0',
  `ticket_promedio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_unidades_vendidas` int NOT NULL DEFAULT '0',
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sucursal_fecha` (`sucursal_id`,`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resumen_venta_diaria`
--

LOCK TABLES `resumen_venta_diaria` WRITE;
/*!40000 ALTER TABLE `resumen_venta_diaria` DISABLE KEYS */;
INSERT INTO `resumen_venta_diaria` VALUES (9,1,'2026-10-28',1.80,0.80,1.00,2,0.90,2,'2026-11-08 06:22:53'),(10,1,'2026-10-29',1.40,0.62,0.78,2,0.70,2,'2026-11-08 06:22:53'),(11,1,'2026-11-08',1.40,0.00,0.00,2,0.70,2,'2026-11-08 01:52:38'),(12,1,'2026-11-13',3.40,0.00,0.00,2,1.70,2,'2026-11-13 12:00:39'),(13,1,'2026-11-20',0.70,0.00,0.00,1,0.70,1,'2026-11-19 23:00:54'),(14,1,'2026-11-22',1.20,0.00,0.00,2,0.60,2,'2026-11-22 07:22:26');
/*!40000 ALTER TABLE `resumen_venta_diaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `db_ventas`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_ventas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_ventas`;

--
-- Table structure for table `caja`
--

DROP TABLE IF EXISTS `caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja`
--

LOCK TABLES `caja` WRITE;
/*!40000 ALTER TABLE `caja` DISABLE KEYS */;
INSERT INTO `caja` VALUES (1,1,'Caja Principal POS 01','CAJA-01',1),(2,1,'Caja RÃ¡pida POS 02','CAJA-02',1);
/*!40000 ALTER TABLE `caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DNI',
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres_o_razon_social` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_documento` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'DNI','00000000','CLIENTE GENÃ‰RICO / VARIOS','Mostrador Farmacia','000000000','sin_correo@farmagest.pe',1),(2,'DNI','10485923','Juan Carlos PÃ©rez Morales','Jr. Las Begonias 342, Ate, Lima','987654321','jperez@gmail.com',1),(3,'DNI','45892314','MarÃ­a Elena Flores Ramos','Av. JosÃ© Carlos MariÃ¡tegui 128, Ate','998877665','mflores@outlook.com',1),(4,'RUC','20601234567','Botica Popular Ate S.A.C.','Av. NicolÃ¡s AyllÃ³n 4500, Ate, Lima','013567890','facturacion@boticapopular.pe',1),(5,'DNI','60651484','BRAYAN EDWIN MAGARIÃ‘O ZAPATA',NULL,NULL,NULL,1),(6,'RUC','20100070970','SUPERMERCADOS PERUANOS SOCIEDAD ANONIMA \'O \' S.P.S.A.',NULL,NULL,NULL,1),(7,'DNI','70188416','DUBAL ANDRE DIAZ CHAVEZ',NULL,NULL,NULL,1),(8,'RUC','10734577583','ALTAMIRANO MASIAS DIEGO GABRIEL',NULL,NULL,NULL,1),(9,'DNI','09189262','YANETT CHAVEZ LEZCANO','Lima','','',1),(10,'RUC','20601127823','ESTUDIO CONTABLE PONCE E.I.R.L.',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupon`
--

DROP TABLE IF EXISTS `cupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupon` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `promocion_id` bigint DEFAULT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `porcentaje_descuento` decimal(5,2) NOT NULL DEFAULT '0.00',
  `monto_fijo_descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `usos_permitidos` int NOT NULL DEFAULT '100',
  `usos_actuales` int NOT NULL DEFAULT '0',
  `fecha_expiracion` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `promocion_id` (`promocion_id`),
  CONSTRAINT `cupon_ibfk_1` FOREIGN KEY (`promocion_id`) REFERENCES `promocion` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupon`
--

LOCK TABLES `cupon` WRITE;
/*!40000 ALTER TABLE `cupon` DISABLE KEYS */;
INSERT INTO `cupon` VALUES (1,NULL,'BIENVENIDA2026',15.00,0.00,500,0,'2027-12-31',1),(2,NULL,'FARMA10',10.00,0.00,200,0,'2027-12-31',1),(3,NULL,'BOTICA5',5.00,0.00,1000,0,'2027-12-31',1);
/*!40000 ALTER TABLE `cupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_devolucion`
--

DROP TABLE IF EXISTS `detalle_devolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_devolucion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `devolucion_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  `nombre_producto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lote_id` bigint DEFAULT NULL,
  `cantidad` int NOT NULL,
  `monto_reembolsado` decimal(10,2) NOT NULL,
  `numero_lote` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `reingresa_a_stock` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `devolucion_id` (`devolucion_id`),
  CONSTRAINT `detalle_devolucion_ibfk_1` FOREIGN KEY (`devolucion_id`) REFERENCES `devolucion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_devolucion`
--

LOCK TABLES `detalle_devolucion` WRITE;
/*!40000 ALTER TABLE `detalle_devolucion` DISABLE KEYS */;
INSERT INTO `detalle_devolucion` VALUES (1,1,2,'Ibuprofeno 400 mg',2,1,0.90,'L-2024-IBU1',0.90,1),(2,2,3,'Medicamento #3',NULL,1,2.50,'LOTE-ORIG',2.50,1);
/*!40000 ALTER TABLE `detalle_devolucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `venta_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  `lote_id` bigint DEFAULT NULL,
  `numero_lote` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento_linea` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal_linea` decimal(10,2) NOT NULL,
  `nombre_producto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_producto` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (1,1,2,2,'L-2024-IBU1',1,0.90,0.40,0.00,0.90,'Ibuprofeno 400 mg','7751234567891'),(2,2,2,2,'L-2024-IBU1',1,0.90,0.40,0.00,0.90,'Ibuprofeno 400 mg','7751234567891'),(3,3,2,2,'L-2024-IBU1',1,0.90,0.40,0.00,0.90,'Ibuprofeno 400 mg','7751234567891'),(4,4,1,1,'L-2024-ALC',1,0.50,0.22,0.00,0.50,'Paracetamol 500 mg','7751234567890'),(5,5,2,2,'L-2024-IBU1',1,0.90,0.40,0.00,0.90,'Ibuprofeno 400 mg','7751234567891'),(6,6,2,NULL,NULL,1,0.90,0.40,0.00,0.90,'Ibuprofeno 400 mg','7751234567891'),(7,7,1,NULL,NULL,1,0.50,0.22,0.00,0.50,'Paracetamol 500 mg','7751234567890'),(8,8,3,NULL,NULL,1,2.50,1.20,0.00,2.50,'Amoxicilina 500 mg','7751234567892'),(9,9,2,NULL,NULL,1,0.90,0.40,0.00,0.90,'Ibuprofeno 400 mg','7751234567891'),(10,10,4,NULL,NULL,1,0.70,0.30,0.00,0.70,'Loratadina 10 mg','7751234567893'),(11,11,4,NULL,NULL,1,0.70,0.30,0.00,0.70,'Loratadina 10 mg','7751234567893'),(12,12,1,NULL,NULL,1,0.50,0.22,0.00,0.50,'Paracetamol 500 mg','7751234567890');
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devolucion`
--

DROP TABLE IF EXISTS `devolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devolucion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `venta_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_devuelto` decimal(10,2) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `serie_nota_credito` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_nota_credito` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_nota_credito` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '07',
  `descripcion_tipo_nc` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'DevoluciÃƒÂ³n por ÃƒÂ­tem',
  `subtotal_devuelto` decimal(10,2) DEFAULT NULL,
  `igv_devuelto` decimal(10,2) DEFAULT NULL,
  `medio_reembolso` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hash_cpe` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_sunat` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ACEPTADA',
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  CONSTRAINT `devolucion_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devolucion`
--

LOCK TABLES `devolucion` WRITE;
/*!40000 ALTER TABLE `devolucion` DISABLE KEYS */;
INSERT INTO `devolucion` VALUES (1,3,1,1,'Devoluci??n de comprobante B001-3',0.90,'2026-10-28 14:10:00','BC01','00000001','07','Anulaci??n de la operaci??n',0.76,0.14,'EFECTIVO','eWdlc3Qtbm90YS1jcmVkaXRvLWJjMDE=','https://sunat.gob.pe/cpe?ruc=10734577583&tipo=07&serie=BC01&numero=00000001&monto=0.90&fecha=2026-10-28','ACEPTADA'),(2,8,1,1,'a',2.50,'2026-11-13 16:37:26','FC01','00000002','07','DevoluciÃ³n por Ã­tem',2.12,0.38,'EFECTIVO','01abBlx4VX3PyezW4u3acpL50Pg=','https://sunat.gob.pe/cpe?ruc=10734577583&tipo=07&serie=FC01&numero=00000002&monto=2.50&hash=01abBlx4VX3PyezW4u3acpL50Pg=','RECHAZADA');
/*!40000 ALTER TABLE `devolucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init ventas schema','SQL','V1__init_ventas_schema.sql',1581117873,'farmagest_user','2026-11-05 06:32:59',1860,1),(2,'2','seed ventas data','SQL','V2__seed_ventas_data.sql',906603580,'farmagest_user','2026-11-05 06:32:59',50,1),(3,'3','add nombre producto devolucion','SQL','V3__add_nombre_producto_devolucion.sql',-447562535,'farmagest_user','2026-11-13 05:17:52',26,1),(4,'4','add nombre producto detalle venta','SQL','V4__add_nombre_producto_detalle_venta.sql',1787810698,'farmagest_user','2026-11-13 17:35:18',10,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promocion`
--

DROP TABLE IF EXISTS `promocion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_alcance` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'POR_PRODUCTO',
  `tipo_descuento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PORCENTAJE',
  `valor_descuento` decimal(10,2) DEFAULT NULL,
  `cantidad_condicion` int DEFAULT NULL,
  `cantidad_pagada` int DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `aplica_por_vencimiento` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocion`
--

LOCK TABLES `promocion` WRITE;
/*!40000 ALTER TABLE `promocion` DISABLE KEYS */;
INSERT INTO `promocion` VALUES (1,'10% de Descuento en Vitaminas','POR_CATEGORIA','PORCENTAJE',10.00,NULL,NULL,'2026-01-01','2027-12-31',0,1),(2,'PromociÃ³n 2x1 en Paracetamol 500mg','POR_PRODUCTO','N_X_M',NULL,2,1,'2026-01-01','2027-12-31',0,1),(3,'Descuento de LiquidaciÃ³n por PrÃ³ximo a Vencer','POR_VENCIMIENTO_PROXIMO','PORCENTAJE',25.00,NULL,NULL,'2026-01-01','2027-12-31',1,1);
/*!40000 ALTER TABLE `promocion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesion_caja`
--

DROP TABLE IF EXISTS `sesion_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion_caja` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `caja_id` int NOT NULL,
  `usuario_id` bigint NOT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `monto_apertura` decimal(10,2) NOT NULL,
  `monto_cierre_sistema` decimal(10,2) DEFAULT NULL,
  `monto_cierre_real` decimal(10,2) DEFAULT NULL,
  `diferencia` decimal(10,2) DEFAULT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ABIERTA',
  `fecha_apertura` datetime NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `caja_id` (`caja_id`),
  CONSTRAINT `sesion_caja_ibfk_1` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesion_caja`
--

LOCK TABLES `sesion_caja` WRITE;
/*!40000 ALTER TABLE `sesion_caja` DISABLE KEYS */;
INSERT INTO `sesion_caja` VALUES (1,1,2,1,100.00,101.00,101.00,0.00,'CERRADA','2026-11-06 06:14:11','2026-11-06 23:59:59','Cierre de turno anterior del vendedor1'),(2,2,1,1,100.00,100.00,100.00,0.00,'CERRADA','2026-11-08 05:45:48','2026-11-08 05:45:55',' | '),(3,2,1,1,100.00,100.00,100.00,0.00,'CERRADA','2026-11-08 05:45:49','2026-11-08 05:46:02',' | '),(4,1,1,1,100.00,105.50,105.50,0.00,'CERRADA','2026-11-08 06:10:13','2026-11-20 04:13:03','Prueba de apertura de Caja 1 | '),(5,1,2,1,100.00,100.00,100.00,0.00,'CERRADA','2026-11-20 04:13:14','2026-11-20 04:14:29',' | '),(6,1,3,1,100.00,100.00,100.00,0.00,'CERRADA','2026-11-20 04:14:35','2026-11-20 04:14:47',' | '),(7,1,1,1,100.00,100.70,100.70,0.00,'CERRADA','2026-11-22 05:36:30','2026-11-22 05:39:54',' | '),(8,1,1,1,100.00,100.00,100.00,0.00,'CERRADA','2026-11-22 12:06:56','2026-11-22 12:09:29',' | '),(9,1,1,1,100.00,NULL,NULL,NULL,'ABIERTA','2026-11-22 12:21:39',NULL,'');
/*!40000 ALTER TABLE `sesion_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `sesion_caja_id` bigint NOT NULL,
  `cliente_id` bigint DEFAULT NULL,
  `usuario_vendedor_id` bigint NOT NULL,
  `tipo_comprobante` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serie_comprobante` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_comprobante` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `monto_descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `igv` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `medio_pago` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_recibido` decimal(10,2) DEFAULT NULL,
  `vuelto` decimal(10,2) DEFAULT NULL,
  `promocion_id` bigint DEFAULT NULL,
  `cupon_id` bigint DEFAULT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETADA',
  `fecha_hora` datetime NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `sesion_caja_id` (`sesion_caja_id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `promocion_id` (`promocion_id`),
  KEY `cupon_id` (`cupon_id`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`sesion_caja_id`) REFERENCES `sesion_caja` (`id`),
  CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  CONSTRAINT `venta_ibfk_3` FOREIGN KEY (`promocion_id`) REFERENCES `promocion` (`id`),
  CONSTRAINT `venta_ibfk_4` FOREIGN KEY (`cupon_id`) REFERENCES `cupon` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES (1,1,1,1,2,'BOLETA','B001','00000001',0.76,0.00,0.14,0.90,'EFECTIVO',1.00,0.10,NULL,NULL,'COMPLETADA','2026-10-28 10:15:00','Comprobante SUNAT Octubre 2026'),(2,1,1,1,3,'BOLETA','B001','00000002',0.76,0.00,0.14,0.90,'EFECTIVO',1.00,0.10,NULL,NULL,'COMPLETADA','2026-10-28 11:30:00','Comprobante SUNAT Octubre 2026'),(3,1,1,9,3,'BOLETA','B001','00000003',0.76,0.00,0.14,0.90,'EFECTIVO',1.00,0.10,NULL,NULL,'ANULADA','2026-10-28 12:00:00','Anulada por Nota de Cr??dito BC01-00000001'),(4,1,1,1,1,'BOLETA','B001','00000004',0.42,0.00,0.08,0.50,'EFECTIVO',1.00,0.50,NULL,NULL,'COMPLETADA','2026-10-29 00:04:29','Comprobante SUNAT con CDR firmado'),(5,1,1,1,2,'BOLETA','B001','00000005',0.76,0.00,0.14,0.90,'EFECTIVO',0.90,0.00,NULL,NULL,'COMPLETADA','2026-10-29 06:21:28','Comprobante SUNAT con CDR firmado'),(6,1,4,1,1,'BOLETA','B001','00000006',0.76,0.00,0.14,0.90,'EFECTIVO',0.90,0.00,NULL,NULL,'COMPLETADA','2026-11-08 06:42:56',''),(7,1,4,1,1,'BOLETA','B001','00000007',0.42,0.00,0.08,0.50,'EFECTIVO',0.50,0.00,NULL,NULL,'COMPLETADA','2026-11-08 06:52:38',''),(8,1,4,10,1,'FACTURA','F001','00000001',2.12,0.00,0.38,2.50,'EFECTIVO',10.00,7.50,NULL,NULL,'COMPLETADA','2026-11-13 16:29:17',''),(9,1,4,1,1,'BOLETA','B001','00000008',0.76,0.00,0.14,0.90,'EFECTIVO',0.90,0.00,NULL,NULL,'COMPLETADA','2026-11-13 17:00:39',''),(10,1,4,1,1,'BOLETA','B001','00000009',0.59,0.00,0.11,0.70,'EFECTIVO',0.70,0.00,NULL,NULL,'COMPLETADA','2026-11-20 04:00:51',''),(11,1,7,5,1,'BOLETA','B001','00000010',0.59,0.00,0.11,0.70,'EFECTIVO',0.70,0.00,NULL,NULL,'COMPLETADA','2026-11-22 05:38:18',''),(12,1,9,5,1,'BOLETA','B001','00000011',0.42,0.00,0.08,0.50,'EFECTIVO',1.50,1.00,NULL,NULL,'COMPLETADA','2026-11-22 12:22:26','');
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta_espera`
--

DROP TABLE IF EXISTS `venta_espera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta_espera` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `sucursal_id` int NOT NULL DEFAULT '1',
  `codigo_espera` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_referencia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `datos_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_hora` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_espera` (`codigo_espera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta_espera`
--

LOCK TABLES `venta_espera` WRITE;
/*!40000 ALTER TABLE `venta_espera` DISABLE KEYS */;
/*!40000 ALTER TABLE `venta_espera` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26  5:34:03

