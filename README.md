# FarmaGest — Sistema de Gestión para Farmacia (Microservicios)

**Botica "Farma Ochenta" · Ate, Lima, Perú**

FarmaGest es un sistema integral de punto de venta (POS), inventario con trazabilidad FEFO por lote, control de compras con recepción física, caja registradora, cupones y promociones, reportes ejecutivos en tiempo real y auditoría inmutable de transacciones. Diseñado y construido con arquitectura de microservicios sobre **Spring Cloud**, **RabbitMQ**, **MySQL (Database-per-Service)** y frontend en **Angular**.

---

## 1. Arquitectura y Puertos del Ecosistema

| Componente | Rol / Responsabilidad | Puerto Local | Base de Datos |
|---|---|---|---|
| **Frontend Web** | Interfaz Angular (POS, Inventario, Catálogo, Compras, Dashboard) | `4200` | — |
| **API Gateway** | Punto de entrada unificado y enrutador (`lb://ms-*`) | `8080` | — |
| **Eureka Server** | Registro y descubrimiento de servicios | `8761` | — |
| **ms-auth** | Autenticación JWT, RBAC, usuarios y permisos | `8081` | `db_auth` |
| **ms-catalogo** | Catálogo de productos, categorías, laboratorios, precios y saneamiento de costos para vendedores | `8082` | `db_catalogo` |
| **ms-inventario** | Motor de inventario FEFO, stock consolidado, semáforos de vencimiento (30/60/90 días), kardex y mermas | `8083` | `db_inventario` |
| **ms-compras** | Proveedores, órdenes de compra, ingreso físico de mercadería con lote y vencimiento obligatorio | `8084` | `db_compras` |
| **ms-ventas** | Punto de venta (POS), apertura/cierre de turnos de caja, clientes con DNI/RUC, promociones y cupones | `8085` | `db_ventas` |
| **ms-reportes** | Métricas analíticas, KPIs ejecutivos, picos de venta semanal y bitácora de auditoría inmutable | `8086` | `db_reportes` |
| **RabbitMQ** | Broker de mensajería asíncrona y coreografía de eventos de dominio | `5672` / `15672` (Panel) | — |
| **MySQL Server** | Servidor de base de datos relacional independiente por servicio | `3306` | 6 schemas independientes |
| **phpMyAdmin** | Interfaz visual para administración de las bases de datos | `8090` | — |

---

## 2. Usuarios y Credenciales del Sistema

| Rol | Usuario | Contraseña | Capacidades Principales |
|---|---|---|---|
| **Administrador** | `admin` | `AdminSecure2026!` | Control total: Dashboard comercial, márgenes, costos, creación de promociones, cambios de precios y anulación de ventas. |
| **Vendedor #1** | `vendedor1` | `Vendedor1Secure2026!` | Operación de mostrador: Apertura de turno de caja, emisión de boletas/facturas en POS, cupones y arqueo de su turno. Costos ocultos por seguridad. |
| **Vendedor #2** | `vendedor2` | `Vendedor2Secure2026!` | Mismo alcance operativo de vendedor. |
| **Almacenero** | `almacenero` | `AlmaceneroSecure2026!` | Recepción de mercadería con lote y vencimiento, semáforos de caducidad y ajustes de inventario / mermas. Sin acceso a ventas POS ni métricas comerciales. |

---

## 3. Topología de Mensajería y Eventos (RabbitMQ)

- **Exchange Principal**: `farmagest.events` (Tipo `topic`, Durable).
- **Dead Letter Exchange**: `farmagest.dlx` $\rightarrow$ Cola de rechazo `q.farmagest.dlq`.

### Matriz de Coreografía de Eventos:
```
ms-compras      ──( compra.ingreso-registrado )──► [ ms-inventario (suma stock y crea lote) ]
ms-ventas       ──( venta.registrada )──────────► [ ms-inventario (descuenta stock por FEFO) ]
ms-ventas       ──( venta.anulada )─────────────► [ ms-inventario (repone stock al lote) ]
ms-ventas       ──( venta.registrada )──────────► [ ms-reportes (KPIs, top productos, medios de pago) ]
Todos           ──( *.* )───────────────────────► [ ms-reportes (bitácora inmutable de auditoría) ]
```

---

## 4. Guía de Puesta en Marcha (Despliegue)

### Requisitos Previos:
- Docker y Docker Compose instalados.
- JDK 17 y Maven 3.x (si se desea compilar localmente).
- Node.js 18+ y Angular CLI (para desarrollo frontend).

### Arranque Completo con Docker Compose:
Desde la raíz del proyecto ejecutar:
```bash
docker compose -f infra/docker-compose.yml up -d
```
Verificar que los 12 contenedores estén activos:
```bash
docker ps
```

---

## 5. Pruebas y Verificación con Postman

La colección completa versionada se encuentra en el directorio `/postman`:
1. `postman/farmagest.postman_collection.json`: Colección con tests automatizados integrados para cada microservicio.
2. `postman/Local.postman_environment.json`: Entorno local apuntando al Gateway (`http://localhost:8080`).

### Orden de Ejecución Sugerido en Postman:
1. `1. ms-auth / Login Admin` $\rightarrow$ Obtiene y almacena `tokenAdmin`.
2. `1. ms-auth / Login Vendedor` $\rightarrow$ Obtiene y almacena `tokenVendedor`.
3. `1. ms-auth / Login Almacenero` $\rightarrow$ Obtiene y almacena `tokenAlmacenero`.
4. `2. ms-catalogo / Listar Productos` y comprobar que el Admin ve costos y el Vendedor no.
5. `3. ms-inventario / Lotes Ordenados por FEFO`.
6. `4. ms-compras / Crear Orden de Compra`.
7. `5. ms-ventas / Emitir Venta POS` (descuenta inventario de forma asíncrona).
8. `6. ms-reportes / Dashboard Ejecutivo` (comprobar métricas y restricción 403 para vendedor).

---

## 6. Scripts de Prueba Automatizada (PowerShell)

Para validación rápida desde consola:
- Probar Ventas, FEFO y Caja:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scratch/test_ms_ventas.ps1
  ```
- Probar Dashboard, KPIs y Auditoría:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scratch/test_ms_reportes.ps1
  ```
