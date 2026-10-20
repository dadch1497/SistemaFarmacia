# 03. Contratos de API REST — FarmaGest

Todos los endpoints se exponen a través del **API Gateway** (`http://localhost:8080`) con el prefijo `/api/`. Todas las respuestas y peticiones emplean codificación `UTF-8` y formato `application/json`.

---

## 1. Convenciones REST y Estándares de Respuesta

### 1.1 Métodos HTTP y Semántica
| Método | Semántica | Códigos Habituales | Regla de Negocio |
|---|---|---|---|
| `GET` | Consultar entidades o colecciones | `200 OK` | Admite paginación `?page=0&size=10&q=` |
| `POST` | Crear entidad o invocar acción no idempotente | `201 Created`, `200 OK` | Usado para creación y transacciones especiales |
| `PUT` | Reemplazo completo de entidad mutable | `200 OK` | Solo entidades mutables (no aplica a ventas/kardex) |
| `PATCH` | Modificación parcial de estado | `200 OK` | Ej. cambio de estado de usuario |
| `DELETE` | Baja lógica de la entidad | `204 No Content` | Marca `activo = false`. **Nunca borrado físico**. |

### 1.2 Formato Estándar de Respuesta de Error
Todas las respuestas de error siguen el estándar RFC 7807 (*Problem Details*):
```json
{
  "timestamp": "2026-10-18T16:00:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Stock insuficiente para el producto 'Paracetamol 500 mg'. Solicitado: 10, Disponible: 3",
  "path": "/api/ventas",
  "details": [
    {
      "field": "detalles[0].cantidad",
      "rejectedValue": 10,
      "message": "Supera el stock actual disponible"
    }
  ]
}
```

### 1.3 Formato Estándar de Colecciones Paginadas
```json
{
  "content": [ ... ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 48,
  "totalPages": 5,
  "last": false
}
```

---

## 2. Endpoints por Microservicio

### 2.1 Microservicio `ms-auth` (Base: `/api/auth`)

#### `POST /api/auth/login`
- **Descripción**: Autentica al usuario mediante credenciales y genera el token JWT.
- **Acceso**: Público.
- **Request Body**:
```json
{
  "username": "vendedor1",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expiracionMs": 28800000,
  "usuario": {
    "id": 2,
    "username": "vendedor1",
    "nombres": "Carlos",
    "apellidos": "Gómez Soto",
    "rol": "ROLE_VENDEDOR",
    "sucursalId": 1,
    "permisos": ["VENTA_CREAR", "VENTA_LISTAR_PROPIAS", "STOCK_CONSULTAR"]
  }
}
```

#### `GET /api/auth/usuarios`
- **Descripción**: Lista de usuarios con paginación y filtro.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `200 OK`**: Lista paginada de usuarios.

#### `POST /api/auth/usuarios`
- **Descripción**: Registro de un nuevo operador en el sistema.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `201 Created`**: Usuario registrado con contraseña hasheada en BCrypt.

#### `DELETE /api/auth/usuarios/{id}`
- **Descripción**: Desactiva el usuario (Baja lógica).
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `204 No Content`**.

---

### 2.2 Microservicio `ms-catalogo` (Base: `/api/catalogo`)

#### `GET /api/catalogo/productos`
- **Descripción**: Listado general de productos para POS o catálogo con filtros por categoría o término de búsqueda.
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_VENDEDOR`, `ROLE_ALMACENERO`.
- **Parámetros**: `?q=paracetamol&categoriaId=1&page=0&size=20`
- **Response `200 OK`**:
```json
{
  "content": [
    {
      "id": 1,
      "codigoBarras": "7751234567890",
      "nombre": "Paracetamol 500 mg",
      "principioActivo": "Paracetamol",
      "concentracion": "500 mg",
      "presentacion": "Tableta",
      "categoria": { "id": 1, "nombre": "Analgésico" },
      "laboratorio": { "id": 3, "nombre": "Laboratorios Portugal" },
      "precioVenta": 0.50,
      "precioCosto": 0.22,
      "requiereReceta": false,
      "activo": true
    }
  ],
  "totalElements": 1
}
```
*Nota*: Si el usuario logueado es `ROLE_VENDEDOR`, el campo `precioCosto` es filtrado o devuelto como `null` a nivel de DTO.

#### `POST /api/catalogo/productos`
- **Descripción**: Crea un nuevo producto.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `201 Created`**.

#### `PUT /api/catalogo/productos/{id}`
- **Descripción**: Actualiza los atributos del producto. Si cambia el precio, registra en `historial_precio` y emite evento.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `200 OK`**.

#### `DELETE /api/catalogo/productos/{id}`
- **Descripción**: Baja lógica del producto.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `204 No Content`**.

---

### 2.3 Microservicio `ms-inventario` (Base: `/api/inventario`)

#### `GET /api/inventario/stock`
- **Descripción**: Consulta de existencias consolidadas por producto y sucursal.
- **Acceso**: Todos los roles.
- **Response `200 OK`**.

#### `GET /api/inventario/lotes/por-vencer`
- **Descripción**: Consulta lotes ordenados por caducidad en el horizonte especificado de días.
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_ALMACENERO`, `ROLE_VENDEDOR` (lectura).
- **Parámetros**: `?dias=30` (o 60, 90).
- **Response `200 OK`**:
```json
[
  {
    "loteId": 14,
    "productoId": 3,
    "nombreProducto": "Amoxicilina 500 mg",
    "numeroLote": "L-2024-AMX",
    "fechaVencimiento": "2026-11-15",
    "diasRestantes": 28,
    "cantidadActual": 45,
    "sucursalId": 1
  }
]
```

#### `GET /api/inventario/stock-bajo`
- **Descripción**: Productos cuyo `stock_actual <= stock_minimo`.
- **Acceso**: Todos los roles.
- **Response `200 OK`**:
```json
[
  {
    "productoId": 2,
    "nombreProducto": "Ibuprofeno 400 mg",
    "stockActual": 8,
    "stockMinimo": 20,
    "sucursalId": 1
  }
]
```

#### `POST /api/inventario/ajustes`
- **Descripción**: Registro de ajustes de stock por merma, rotura o conteo físico.
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_ALMACENERO`.
- **Request Body**:
```json
{
  "productoId": 1,
  "loteId": 4,
  "sucursalId": 1,
  "tipoAjuste": "AJUSTE_MERMA",
  "cantidad": 5,
  "motivo": "Empaque dañado durante limpieza de estante"
}
```
- **Response `201 Created`**: Devuelve el registro de Kardex generado.

#### `GET /api/inventario/kardex/{productoId}`
- **Descripción**: Historial cronológico de entradas y salidas de un producto.
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_ALMACENERO`.
- **Response `200 OK`**.

---

### 2.4 Microservicio `ms-compras` (Base: `/api/compras`)

#### `GET /api/compras/proveedores` & `POST /api/compras/proveedores`
- **Descripción**: CRUD de proveedores farmacéuticos.
- **Acceso**: `ROLE_ADMINISTRADOR` (gestión completa) / `ROLE_ALMACENERO` (consulta).

#### `POST /api/compras/ordenes`
- **Descripción**: Emisión de una orden de compra para abastecimiento.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `201 Created`**.

#### `POST /api/compras/ingresos`
- **Descripción**: Recepción física de mercadería en almacén. Registra la guía/factura del proveedor, los lotes recibidos y sus vencimientos, y dispara el evento `compra.ingreso-registrado`.
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_ALMACENERO`.
- **Request Body**:
```json
{
  "ordenCompraId": 105,
  "sucursalId": 1,
  "numeroGuia": "GR-001-002341",
  "numeroFactura": "F001-000456",
  "observaciones": "Recepción conforme sin observaciones de cadena de frío",
  "items": [
    {
      "productoId": 1,
      "numeroLote": "LOT-2026-99",
      "fechaVencimiento": "2028-06-30",
      "cantidadRecibida": 500,
      "costoUnitarioReal": 0.20
    }
  ]
}
```
- **Response `201 Created`**.

---

### 2.5 Microservicio `ms-ventas` (Base: `/api/ventas` y `/api/caja`)

#### `POST /api/ventas/cupones/validar`
- **Descripción**: Verifica vigencia, límite de usos y exclusiones (medicamentos que requieren receta quedan excluidos).
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_VENDEDOR`.
- **Request Body**:
```json
{
  "codigoCupon": "BIENVENIDA10",
  "productos": [
    { "productoId": 1, "requiereReceta": false, "subtotal": 20.00 }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "valido": true,
  "cuponId": 3,
  "tipoDescuento": "PORCENTAJE",
  "descuentoTotal": 2.00,
  "mensaje": "Cupón aplicado con éxito (10% de descuento)"
}
```

#### `POST /api/ventas`
- **Descripción**: Registro de venta en mostrador (POS). Valida caja abierta, aplica reglas de negocio (no venta bajo el costo, FEFO para selección de lote), descuenta stock mediante evento y emite boleta/factura.
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_VENDEDOR`.
- **Request Body**:
```json
{
  "sucursalId": 1,
  "tipoComprobante": "BOLETA",
  "clienteId": null,
  "medioPago": "EFECTIVO",
  "montoRecibido": 20.00,
  "codigoCupon": null,
  "descuentoManualPorcentaje": 0.0,
  "items": [
    {
      "productoId": 1,
      "cantidad": 10,
      "precioUnitario": 0.50
    }
  ]
}
```
- **Response `201 Created`**:
```json
{
  "ventaId": 1042,
  "serieComprobante": "B001",
  "numeroComprobante": "00001042",
  "subtotal": 5.00,
  "descuento": 0.00,
  "total": 5.00,
  "montoRecibido": 20.00,
  "vuelto": 15.00,
  "estado": "COMPLETADA",
  "fechaHora": "2026-10-18T16:15:00Z"
}
```

#### `POST /api/ventas/{id}/anular`
- **Descripción**: Anula una venta previamente registrada. Devuelve el stock al lote original mediante evento y genera auditoría.
- **Acceso**: `ROLE_ADMINISTRADOR`. (Los vendedores deben solicitar la anulación al admin).
- **Request Body**:
```json
{
  "motivo": "Cliente desistió de la compra antes de retirarse"
}
```
- **Response `200 OK`**.

#### `POST /api/ventas/{id}/devoluciones`
- **Descripción**: Registra una devolución parcial o total de productos.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `201 Created`**.

#### `POST /api/caja/apertura`
- **Descripción**: Inicia el turno de un vendedor con su saldo base de efectivo.
- **Acceso**: `ROLE_ADMINISTRADOR`, `ROLE_VENDEDOR`.
- **Request Body**: `{ "cajaId": 1, "montoApertura": 150.00 }`
- **Response `201 Created`**.

#### `POST /api/caja/{id}/cierre`
- **Descripción**: Cierre de turno y arqueo físico.
- **Acceso**: `ROLE_ADMINISTRADOR` (puede cerrar cualquier caja) / `ROLE_VENDEDOR` (solo su propia sesión).
- **Request Body**:
```json
{
  "montoCierreReal": 850.50,
  "observaciones": "Cuadre conforme"
}
```
- **Response `200 OK`**:
```json
{
  "sesionId": 45,
  "montoCierreSistema": 850.50,
  "montoCierreReal": 850.50,
  "diferencia": 0.00,
  "estado": "CERRADA"
}
```

---

### 2.6 Microservicio `ms-reportes` (Base: `/api/reportes`)

#### `GET /api/reportes/dashboard`
- **Descripción**: Provee las 5 tarjetas de KPIs y bloques consolidados del administrador.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Parámetros**: `?periodo=mes` (o `dia`, `anio`, `rango&desde=...&hasta=...`)
- **Response `200 OK`**:
```json
{
  "periodo": "mes",
  "kpis": {
    "ventasHoy": { "monto": 1450.00, "variacionPorcentual": 8.5 },
    "ventasMes": { "monto": 42300.00, "variacionPorcentual": 12.3 },
    "ventasAnio": { "monto": 312000.00 },
    "utilidadMes": { "monto": 14805.00, "margenPorcentual": 35.0 },
    "ticketPromedio": { "monto": 18.50, "totalTransaccionesDia": 78 }
  },
  "productosMasVendidos": [
    { "rank": 1, "producto": "Paracetamol 500 mg", "unidades": 850, "monto": 425.00 },
    { "rank": 2, "producto": "Alcohol 70° 250 ml", "unidades": 210, "monto": 1260.00 }
  ],
  "ventasPorMedioPago": [
    { "medioPago": "EFECTIVO", "porcentaje": 55.0, "total": 23265.00 },
    { "medioPago": "YAPE_PLIN", "porcentaje": 30.0, "total": 12690.00 },
    { "medioPago": "TARJETA", "porcentaje": 15.0, "total": 6345.00 }
  ],
  "ventasPorVendedor": [
    { "vendedor": "Carlos Gómez", "monto": 22400.00 },
    { "vendedor": "Lucía Morales", "monto": 19900.00 }
  ]
}
```

#### `GET /api/reportes/ventas/por-dia-semana`
- **Descripción**: Promedio de ventas por día de la semana (últimas 4 semanas) para el gráfico de barras.
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `200 OK`**:
```json
[
  { "dia": "LUNES", "montoPromedio": 1200.00, "esMayor": false },
  { "dia": "MARTES", "montoPromedio": 1350.00, "esMayor": false },
  { "dia": "MIERCOLES", "montoPromedio": 1280.00, "esMayor": false },
  { "dia": "JUEVES", "montoPromedio": 1410.00, "esMayor": false },
  { "dia": "VIERNES", "montoPromedio": 1890.00, "esMayor": false },
  { "dia": "SABADO", "montoPromedio": 2350.00, "esMayor": true },
  { "dia": "DOMINGO", "montoPromedio": 1600.00, "esMayor": false }
]
```

#### `GET /api/reportes/auditoria`
- **Descripción**: Bitácora inmutable de eventos críticos (anulaciones, ajustes, bajas, cambios de precio).
- **Acceso**: `ROLE_ADMINISTRADOR`.
- **Response `200 OK`**.
