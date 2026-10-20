# 05. Matriz de Roles y Permisos de Seguridad — FarmaGest

Este documento define la matriz de **Control de Acceso Basado en Roles (RBAC)** y los mecanismos de autorización implementados a nivel de API Gateway y microservicios con **Spring Security** (`@PreAuthorize`).

---

## 1. Roles del Sistema

| Rol | Código en Sistema | Descripción |
|---|---|---|
| **Administrador** | `ROLE_ADMINISTRADOR` | Propietario o regente farmacéutico. Acceso total operativo, financiero, de configuración, auditoría y seguridad. |
| **Vendedor** | `ROLE_VENDEDOR` | Operador de mostrador (POS), atención al cliente, cobranza, arqueo de su propia caja y consulta de existencias. |
| **Almacenero** | `ROLE_ALMACENERO` | Encargado de recepción física de mercadería, control de lotes, fechas de vencimiento, mermas y ajustes de Kardex. |

---

## 2. Matriz de Permisos por Acción de Negocio

| Módulo / Acción de Negocio | Administrador | Vendedor | Almacenero | Código de Permiso / Expresión `@PreAuthorize` |
|---|:---:|:---:|:---:|---|
| **Realizar ventas (POS)** | ✅ | ✅ | ❌ | `hasAnyRole('ADMINISTRADOR', 'VENDEDOR')` |
| **Aplicar descuentos comerciales** | ✅ Libre | ⚠️ Hasta 5% | ❌ | `hasRole('ADMINISTRADOR')` o validación en service `<= 5%` |
| **Anular ventas** | ✅ | ❌ | ❌ | `hasRole('ADMINISTRADOR')` |
| **Ver ventas de otros vendedores** | ✅ Todas | ❌ Solo las suyas | ❌ | `hasRole('ADMINISTRADOR')` (en vendedor se fuerza filtro por su `usuario_id`) |
| **Apertura y Cierre de caja** | ✅ Todas | ✅ Solo su turno | ❌ | `hasAnyRole('ADMINISTRADOR', 'VENDEDOR')` (validación de propiedad en service) |
| **Consultar catálogo y stock** | ✅ | ✅ | ✅ | `hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')` |
| **Crear/editar productos y precios** | ✅ | ❌ | ❌ | `hasRole('ADMINISTRADOR')` |
| **Ver costos de adquisición y utilidades**| ✅ | ❌ | ❌ | `hasRole('ADMINISTRADOR')` (campos excluidos en DTO de respuesta para otros roles) |
| **Ajustes de stock / mermas manuales** | ✅ | ❌ | ✅ | `hasAnyRole('ADMINISTRADOR', 'ALMACENERO')` |
| **Gestión de proveedores y órdenes de compra**| ✅ | ❌ | ❌ | `hasRole('ADMINISTRADOR')` |
| **Ingreso físico de mercadería (guía/lotes)** | ✅ | ❌ | ✅ | `hasAnyRole('ADMINISTRADOR', 'ALMACENERO')` |
| **Consultar alertas de vencimiento** | ✅ | ✅ (Solo lectura) | ✅ | `hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')` |
| **Registrar y consultar clientes** | ✅ | ✅ | ❌ | `hasAnyRole('ADMINISTRADOR', 'VENDEDOR')` |
| **Crear y editar promociones y cupones** | ✅ | ❌ (Solo aplicarlas) | ❌ | `hasRole('ADMINISTRADOR')` |
| **Dashboard y Reportes de ventas/ganancias**| ✅ | ❌ | ❌ | `hasRole('ADMINISTRADOR')` |
| **Reportes de inventario y rotación** | ✅ | ❌ | ⚠️ Solo inventario | `hasAnyRole('ADMINISTRADOR', 'ALMACENERO')` |
| **Gestión de usuarios, roles y configuración** | ✅ | ❌ | ❌ | `hasRole('ADMINISTRADOR')` |
| **Consulta de bitácora de auditoría** | ✅ | ❌ | ❌ | `hasRole('ADMINISTRADOR')` |

---

## 3. Mapeo Detallado de Endpoints REST vs Seguridad

### 3.1 `ms-auth`
| Endpoint | Método | Regla de Acceso Spring Security |
|---|---|---|
| `/api/auth/login` | `POST` | `permitAll()` |
| `/api/auth/usuarios/**` | `GET`, `POST`, `PUT`, `DELETE` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/auth/roles/**` | `GET` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |

### 3.2 `ms-catalogo`
| Endpoint | Método | Regla de Acceso Spring Security |
|---|---|---|
| `/api/catalogo/productos` | `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")` |
| `/api/catalogo/productos/{id}` | `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")` |
| `/api/catalogo/productos` | `POST` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/catalogo/productos/{id}` | `PUT`, `PATCH`, `DELETE` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/catalogo/categorias/**` | `GET` | `@PreAuthorize("isAuthenticated()")` |
| `/api/catalogo/categorias/**` | `POST`, `PUT`, `DELETE` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/catalogo/laboratorios/**` | `GET` | `@PreAuthorize("isAuthenticated()")` |
| `/api/catalogo/laboratorios/**` | `POST`, `PUT`, `DELETE` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |

### 3.3 `ms-inventario`
| Endpoint | Método | Regla de Acceso Spring Security |
|---|---|---|
| `/api/inventario/stock/**` | `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")` |
| `/api/inventario/stock-bajo` | `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")` |
| `/api/inventario/lotes/por-vencer`| `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")` |
| `/api/inventario/kardex/**` | `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")` |
| `/api/inventario/ajustes` | `POST` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")` |

### 3.4 `ms-compras`
| Endpoint | Método | Regla de Acceso Spring Security |
|---|---|---|
| `/api/compras/proveedores` | `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")` |
| `/api/compras/proveedores/**` | `POST`, `PUT`, `DELETE` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/compras/ordenes/**` | `GET`, `POST`, `PUT` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/compras/ingresos` | `POST` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")` |

### 3.5 `ms-ventas`
| Endpoint | Método | Regla de Acceso Spring Security |
|---|---|---|
| `/api/ventas` | `POST` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")` |
| `/api/ventas/{id}` | `GET` | `@PreAuthorize("hasRole('ADMINISTRADOR') or (hasRole('VENDEDOR') and @securityService.esPropietarioVenta(#id, authentication))")` |
| `/api/ventas` | `GET` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")` (Vendedor filtra automáticamente solo las suyas) |
| `/api/ventas/{id}/anular` | `POST` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/ventas/{id}/devoluciones` | `POST` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/ventas/cupones/validar` | `POST` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")` |
| `/api/caja/apertura` | `POST` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")` |
| `/api/caja/{id}/cierre` | `POST` | `@PreAuthorize("hasRole('ADMINISTRADOR') or (hasRole('VENDEDOR') and @securityService.esPropietarioCaja(#id, authentication))")` |
| `/api/ventas/promociones/**` | `POST`, `PUT`, `DELETE` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/ventas/clientes/**` | `GET`, `POST`, `PUT` | `@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")` |

### 3.6 `ms-reportes`
| Endpoint | Método | Regla de Acceso Spring Security |
|---|---|---|
| `/api/reportes/dashboard` | `GET` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/reportes/ventas/**` | `GET` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |
| `/api/reportes/auditoria` | `GET` | `@PreAuthorize("hasRole('ADMINISTRADOR')")` |

---

## 4. Políticas de Seguridad a Nivel de Datos (*Data-Level Security*)

1. **Ocultación de Costos y Márgenes**:
   - Jackson `@JsonView` o DTOs diferenciados (`ProductoResumenDto` vs `ProductoAdminDto`). Los endpoints consultados por `ROLE_VENDEDOR` nunca serializan `precio_costo`, `utilidad` ni márgenes brutos.
2. **Aislamiento de Cajas y Ventas de Vendedor**:
   - En peticiones ejecutadas por un vendedor, el backend extrae el `usuario_id` del token JWT verificado y fuerza la cláusula SQL:
     ```sql
     WHERE usuario_vendedor_id = :currentUserId AND sucursal_id = :currentSucursalId
     ```
   - Un vendedor no puede consultar ventas emitidas por otros compañeros ni cerrar sesiones de caja ajenas.
3. **Regla de Descuento POS**:
   - En el endpoint `POST /api/ventas`, si `descuentoManualPorcentaje > 5.0` y el usuario no posee `ROLE_ADMINISTRADOR`, la petición es rechazada con código `403 Forbidden` y el mensaje: *"Los vendedores solo pueden aplicar hasta 5% de descuento directo. Un porcentaje mayor requiere autorización del Administrador."*
