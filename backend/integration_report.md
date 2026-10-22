# Informe de integración con SUNAT

## Resumen rápido
- En el proyecto **FARMACIA** (Spring Boot backend + Angular frontend + Docker) **no existe** lógica que envíe facturas a la API de SUNAT.
- Sólo se encontró una clase de configuración `SunatProperties` sin uso en el código.
- No hay servicios (`SunatService`, `SunatClient`), ni endpoints `/sunat/**` en Swagger, ni consumidores de RabbitMQ relacionados.
- La UI POS no muestra ningún estado SUNAT tras registrar una venta.

## Pasos realizados para comprobarlo
1. **Búsqueda de configuraciones** (`*.yml`, `SunatProperties.java`).
2. **Búsqueda de clases/beans que consuman SUNAT** (`Sunat`, `Greenter`, `SOAP`, `CDR`).
3. **Revisión de Swagger/OpenAPI** – ausencia de rutas `/sunat/**`.
4. **Inspección de colas RabbitMQ** – no hay consumidores con prefijos SUNAT.
5. **Prueba manual en Angular** – venta registrada sin estado SUNAT.
6. **Revisión de logs** de microservicios – nada relacionado con SUNAT.

## Conclusión
> Actualmente el sistema **no está integrado** con la API de SUNAT.

## Próximos pasos sugeridos (si deseas añadir la integración)
1. **Crear un micro‑servicio `ms-sunat`** (Java) que use la librería oficial de SUNAT o el cliente Java de Greenter.
2. **Modificar `ms‑ventas`** para publicar un evento `VentaRegistrada` y que `ms‑sunat` lo consuma.
3. **Exponer endpoint** `POST /sunat/factura` que reciba la factura y devuelva el CDR.
4. **Actualizar la UI Angular** para mostrar el `estadoSunat` de la venta.
5. **Escribir pruebas de integración** simulando respuestas de SUNAT y verificar almacenamiento y visualización del CDR.

---

*Este informe fue generado automáticamente por el asistente Antigravity.*