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
import pe.farmagest.ventas.entity.DetalleVenta;
import pe.farmagest.ventas.entity.Venta;

import java.util.ArrayList;
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
}
