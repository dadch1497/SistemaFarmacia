# Informe de Integración con SUNAT — FarmaGest

## Resumen Ejecutivo
El sistema **FarmaGest** cuenta con una arquitectura de facturación electrónica integrada para la emisión de Boletas y Facturas ante SUNAT (Perú) bajo el estándar **UBL 2.1**:

1. **Microservicio Emisor SUNAT (`ms-sunat-php`):**
   - Implementado con PHP y el SDK oficial **Greenter** (`see.send`).
   - Firma digital XML con certificado digital X.509 (`.pem`).
   - Comunicación directa con los Web Services SOAP de SUNAT (ambiente BETA y PRODUCCIÓN).
   - Generación de CDR (Constancia de Recepción) y código Hash CPE.

2. **Integración con `ms-ventas`:**
   - La clase `SunatPhpClient.java` en `ms-ventas` envía automáticamente la factura/boleta al microservicio `ms-sunat-php` tras registrar la venta.
   - En caso de indisponibilidad temporal de SUNAT, la venta se emite localmente y queda en cola para reintento asíncrono.

3. **Enrutamiento en API Gateway:**
   - Ruta `/api/sunat/**` mapeada en `api-gateway` para consulta de estado de comprobantes y endpoints de salud.
   - Servidor Gateway Mock (`mock-server.js`) con emulación completa de respuestas CDR (`200 ACEPTADA`, código hash CPE y enlace QR).

4. **Interfaz de Usuario (POS Angular):**
   - El POS muestra el indicador oficial de aprobación SUNAT (`✓ SUNAT: ACEPTADA`) en el comprobante emitido.
   - El módulo de Reportes permite exportar el Registro de Ventas e Ingresos en formato estándar PLE / SUNAT (Formato 14.1 en CSV).
