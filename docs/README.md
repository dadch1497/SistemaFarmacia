# FarmaGest — Sistema de Gestión para Farmacia (Microservicios)
## Documentación Técnica de Diseño — Etapa 0

Bienvenido a la documentación de arquitectura y diseño técnico de **FarmaGest**, un sistema web de microservicios diseñado para la gestión integral de farmacias y boticas en el Perú (POS, inventario con FEFO, compras, promociones, caja y reportes analíticos).

---

### Índice de Documentos

1. **[01. Arquitectura del Sistema](01-arquitectura.md)**
   - Topología de microservicios y puertos.
   - Flujos de comunicación (Gateway + Eureka + RabbitMQ).
   - Estrategia Multi-sucursal (`sucursal_id`).
   - Consistencia eventual y manejo de errores (Dead Letter Queue).

2. **[02. Modelo de Datos por Microservicio](02-modelo-datos.md)**
   - Esquemas DDL para MySQL (una base de datos aislada por servicio).
   - Diagramas Entidad-Relación (Mermaid).
   - Tablas, llaves primarias/foráneas, índices y preparación multi-sucursal.

3. **[03. Contratos de API REST](03-contratos-api.md)**
   - Convenciones REST y manejo de códigos HTTP (200, 201, 204, 400, 401, 403, 404, 409).
   - Especificación detallada de endpoints por microservicio.
   - Payloads de solicitud y respuesta (JSON).
   - Endpoints especiales de negocio (POS, anulación, arqueo de caja, FEFO).

4. **[04. Catálogo de Mensajería y Eventos (RabbitMQ)](04-eventos-rabbitmq.md)**
   - Definición de Exchanges, Colas y Routing Keys.
   - Esquemas JSON de cada evento de dominio.
   - Publicadores, consumidores y lógica de reacción.
   - Estrategia de reintentos y Dead-Letter Exchange (DLX / DLQ).

5. **[05. Matriz de Roles y Permisos de Seguridad](05-matriz-permisos.md)**
   - Matriz RBAC (Administrador, Vendedor, Almacenero).
   - Mapeo de permisos a endpoints REST (`@PreAuthorize`).
   - Reglas de control de acceso a nivel de datos (visibilidad por usuario/sucursal).
