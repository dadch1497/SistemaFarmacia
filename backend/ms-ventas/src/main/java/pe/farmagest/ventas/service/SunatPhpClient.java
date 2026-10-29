package pe.farmagest.ventas.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import pe.farmagest.ventas.entity.Cliente;
import pe.farmagest.ventas.entity.DetalleDevolucion;
import pe.farmagest.ventas.entity.DetalleVenta;
import pe.farmagest.ventas.entity.Devolucion;
import pe.farmagest.ventas.entity.TipoComprobante;
import pe.farmagest.ventas.entity.Venta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Cliente Java que se comunica con el microservicio PHP (Greenter UBL 2.1)
 * para la emisión y validación de comprobantes electrónicos ante SUNAT.
 */
@Component
public class SunatPhpClient {

    private static final Logger log = LoggerFactory.getLogger(SunatPhpClient.class);

    private final RestTemplate restTemplate;

    @Value("${sunat.php.url:http://ms-sunat-php:80}")
    private String sunatPhpUrl;

    public SunatPhpClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void enviarFactura(Venta venta) {
        try {
            String url = sunatPhpUrl + "/factura";
            Map<String, Object> payload = new HashMap<>();
            payload.put("ventaId", venta.getId());
            payload.put("tipoComprobante", venta.getTipoComprobante().name());
            payload.put("serie", venta.getSerieComprobante());
            payload.put("numero", venta.getNumeroComprobante());
            payload.put("fechaEmision", venta.getFechaHora() != null ? venta.getFechaHora().toString() : null);
            payload.put("subtotal", venta.getSubtotal());
            payload.put("igv", venta.getIgv());
            payload.put("total", venta.getTotal());
            payload.put("montoDescuento", venta.getMontoDescuento());

            // Datos del cliente
            Cliente c = venta.getCliente();
            if (c != null) {
                Map<String, Object> clienteMap = new HashMap<>();
                clienteMap.put("tipoDocumento", c.getTipoDocumento() != null ? c.getTipoDocumento().name() : "DNI");
                clienteMap.put("numeroDocumento", c.getNumeroDocumento());
                clienteMap.put("razonSocial", c.getNombresORazonSocial());
                clienteMap.put("direccion", c.getDireccion());
                payload.put("cliente", clienteMap);
            }

            // Detalles / Ítems
            List<Map<String, Object>> items = new ArrayList<>();
            if (venta.getDetalles() != null) {
                for (DetalleVenta d : venta.getDetalles()) {
                    Map<String, Object> it = new HashMap<>();
                    it.put("productoId", d.getProductoId());
                    it.put("numeroLote", d.getNumeroLote());
                    it.put("cantidad", d.getCantidad());
                    it.put("precioUnitario", d.getPrecioUnitario());
                    it.put("subtotalLinea", d.getSubtotalLinea());
                    items.add(it);
                }
            }
            payload.put("items", items);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            log.info("Enviando comprobante fiscal {}-{} a servicio SUNAT PHP ({})",
                    venta.getSerieComprobante(), venta.getNumeroComprobante(), url);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Comprobante {}-{} procesado exitosamente por SUNAT PHP: {}",
                        venta.getSerieComprobante(), venta.getNumeroComprobante(), response.getBody());
            } else {
                log.warn("Respuesta no exitosa al enviar a SUNAT PHP: {}", response.getStatusCode());
            }
        } catch (Exception ex) {
            log.warn("No se pudo conectar inmediatamente con ms-sunat-php ({}), la venta quedará en cola: {}",
                    sunatPhpUrl, ex.getMessage());
        }
    }

    public Map<String, Object> enviarNotaCredito(Devolucion devolucion) {
        try {
            String url = sunatPhpUrl + "/nota-credito";
            Map<String, Object> payload = new HashMap<>();
            payload.put("devolucionId", devolucion.getId());
            payload.put("tipoComprobante", "NOTA_CREDITO");
            payload.put("tipoDocumento", "07");
            payload.put("serie", devolucion.getSerieNotaCredito());
            payload.put("numero", devolucion.getNumeroNotaCredito());
            payload.put("fechaEmision", devolucion.getFechaHora() != null ? devolucion.getFechaHora().toString() : null);
            payload.put("subtotal", devolucion.getSubtotalDevuelto());
            payload.put("igv", devolucion.getIgvDevuelto());
            payload.put("total", devolucion.getTotalDevuelto());
            payload.put("tipoNotaCredito", devolucion.getTipoNotaCredito());
            payload.put("codMotivo", devolucion.getTipoNotaCredito() != null ? devolucion.getTipoNotaCredito() : "07");
            payload.put("motivo", devolucion.getMotivo());
            payload.put("desMotivo", devolucion.getMotivo());

            Venta venta = devolucion.getVenta();
            if (venta != null) {
                payload.put("ventaId", venta.getId());
                payload.put("tipoComprobanteModificado", venta.getTipoComprobante() != null ? venta.getTipoComprobante().name() : "BOLETA");
                payload.put("tipDocAfectado", venta.getTipoComprobante() == TipoComprobante.FACTURA ? "01" : "03");
                payload.put("serieModificado", venta.getSerieComprobante());
                payload.put("numeroModificado", venta.getNumeroComprobante());
                payload.put("numDocAfectado", venta.getSerieComprobante() + "-" + venta.getNumeroComprobante());

                // Datos del cliente
                Cliente c = venta.getCliente();
                if (c != null) {
                    Map<String, Object> clienteMap = new HashMap<>();
                    clienteMap.put("tipoDocumento", c.getTipoDocumento() != null ? c.getTipoDocumento().name() : "DNI");
                    clienteMap.put("numeroDocumento", c.getNumeroDocumento());
                    clienteMap.put("razonSocial", c.getNombresORazonSocial());
                    clienteMap.put("direccion", c.getDireccion());
                    payload.put("cliente", clienteMap);
                }
            }

            // Detalles / Ítems devueltos
            List<Map<String, Object>> items = new ArrayList<>();
            if (devolucion.getDetalles() != null) {
                for (DetalleDevolucion d : devolucion.getDetalles()) {
                    Map<String, Object> it = new HashMap<>();
                    it.put("productoId", d.getProductoId());
                    it.put("descripcion", d.getNombreProducto() != null ? d.getNombreProducto() : ("Medicamento #" + d.getProductoId()));
                    it.put("numeroLote", d.getNumeroLote());
                    it.put("cantidad", d.getCantidad());
                    it.put("precioUnitario", d.getPrecioUnitario());
                    it.put("subtotalLinea", d.getMontoReembolsado());
                    items.add(it);
                }
            }
            payload.put("items", items);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            log.info("Enviando Nota de Crédito {}-{} a servicio SUNAT PHP ({})",
                    devolucion.getSerieNotaCredito(), devolucion.getNumeroNotaCredito(), url);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Nota de Crédito {}-{} procesada por SUNAT PHP: {}",
                        devolucion.getSerieNotaCredito(), devolucion.getNumeroNotaCredito(), response.getBody());
                @SuppressWarnings("unchecked")
                Map<String, Object> bodyMap = (Map<String, Object>) response.getBody();
                return bodyMap;
            } else {
                log.warn("Respuesta no exitosa al enviar NC a SUNAT PHP: {}", response.getStatusCode());
            }
        } catch (Exception ex) {
            log.warn("No se pudo conectar inmediatamente con ms-sunat-php ({}) para NC: {}",
                    sunatPhpUrl, ex.getMessage());
        }
        return Collections.emptyMap();
    }
}
