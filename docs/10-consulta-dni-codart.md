# Consulta de DNI con CodArt

El POS busca primero el cliente guardado. Solo un DNI ausente se consulta externamente al pulsar Validar. El backend vuelve a verificar la base de datos antes de llamar a CodArt; guarda el DNI y nombres/apellidos confirmados para consultas futuras. No hay refrescos automáticos ni reintentos externos. RUC usa la misma búsqueda local y, si no existe, consulta CodArt para recuperar y guardar la razón social.

Configurar `CODART_API_TOKEN` en `infra/.env` (archivo ignorado por Git). No poner la clave en Angular, capturas, logs ni repositorio. Después ejecutar desde la raíz: `docker compose -f infra/docker-compose.yml up -d --no-deps ms-ventas`. Cambiar el plan del proveedor no requiere cambiar el código mientras conserve el contrato.

POST `/api/ventas/clientes/consulta-dni`, cuerpo `{ "dni": "12345678" }`. Acceso de administrador/vendedor. Comprueba 8 dígitos, excluye el cliente genérico, verifica que la respuesta corresponda al documento y no guarda campos restringidos. Un cliente inactivo no se reactiva ni vuelve a consultarse.

El bloqueo de peticiones concurrentes opera por instancia; actualmente se despliega una instancia. La unicidad del documento en BD evita filas duplicadas, incluso frente a registro manual simultáneo. Con múltiples instancias se necesitaría coordinación distribuida para evitar consultas externas simultáneas duplicadas.

Sin token, con cuota agotada o fallo del proveedor, se informa y permite registrar manualmente sin inventar nombres. La cuota y vigencia las determina CodArt; una respuesta fallida podría consumir peticiones según sus reglas. No se ha certificado la procedencia oficial de los datos.

Pruebas: Maven ms-ventas y `node --test tests/consulta-dni.test.cjs` en frontend/farmagest-web. Las pruebas usan respuestas simuladas y no consumen cuota. La comprobación con un DNI real requiere el token local y sesión válida en FarmaGest.

Ficha del POS: los resultados locales y externos se presentan antes de seleccionar. Aceptar conserva la identidad y actualiza contactos opcionales mediante PATCH /api/ventas/clientes/{id}/contacto. Cancelar no cambia el cliente de la venta; el resultado externo ya consultado permanece guardado para no consumir otra petición.


RUC: POST `/api/ventas/clientes/consulta-ruc` con `{ "ruc": "20538856674" }`, mismos roles que DNI. Valida 11 dígitos, documento devuelto y tipo 6. Solo conserva RUC y razón social; no certifica estado ACTIVO/HABIDO ni implementa facturación electrónica. La ficha simplificada muestra documento y razón social para confirmar. Las pruebas usan respuestas simuladas sin consumir cuota.
