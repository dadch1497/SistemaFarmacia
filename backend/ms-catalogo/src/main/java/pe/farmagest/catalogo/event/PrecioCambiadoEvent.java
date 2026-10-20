package pe.farmagest.catalogo.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class PrecioCambiadoEvent {

    private String eventId = UUID.randomUUID().toString();
    private String eventType = "catalogo.precio-cambiado";
    private String timestamp = Instant.now().toString();
    private String sourceService = "ms-catalogo";
    private Integer sucursalId = 1;
    private Payload payload;

    public static class Payload {
        private Long productoId;
        private String nombreProducto;
        private BigDecimal precioVentaAnterior;
        private BigDecimal precioVentaNuevo;
        private BigDecimal precioCostoAnterior;
        private BigDecimal precioCostoNuevo;
        private Long usuarioId;
        private String username;
        private String motivo;
        private String fechaHora;

        public Payload() {
        }

        public Long getProductoId() {
            return productoId;
        }

        public void setProductoId(Long productoId) {
            this.productoId = productoId;
        }

        public String getNombreProducto() {
            return nombreProducto;
        }

        public void setNombreProducto(String nombreProducto) {
            this.nombreProducto = nombreProducto;
        }

        public BigDecimal getPrecioVentaAnterior() {
            return precioVentaAnterior;
        }

        public void setPrecioVentaAnterior(BigDecimal precioVentaAnterior) {
            this.precioVentaAnterior = precioVentaAnterior;
        }

        public BigDecimal getPrecioVentaNuevo() {
            return precioVentaNuevo;
        }

        public void setPrecioVentaNuevo(BigDecimal precioVentaNuevo) {
            this.precioVentaNuevo = precioVentaNuevo;
        }

        public BigDecimal getPrecioCostoAnterior() {
            return precioCostoAnterior;
        }

        public void setPrecioCostoAnterior(BigDecimal precioCostoAnterior) {
            this.precioCostoAnterior = precioCostoAnterior;
        }

        public BigDecimal getPrecioCostoNuevo() {
            return precioCostoNuevo;
        }

        public void setPrecioCostoNuevo(BigDecimal precioCostoNuevo) {
            this.precioCostoNuevo = precioCostoNuevo;
        }

        public Long getUsuarioId() {
            return usuarioId;
        }

        public void setUsuarioId(Long usuarioId) {
            this.usuarioId = usuarioId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getMotivo() {
            return motivo;
        }

        public void setMotivo(String motivo) {
            this.motivo = motivo;
        }

        public String getFechaHora() {
            return fechaHora;
        }

        public void setFechaHora(String fechaHora) {
            this.fechaHora = fechaHora;
        }
    }

    public PrecioCambiadoEvent() {
    }

    public PrecioCambiadoEvent(Payload payload) {
        this.payload = payload;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getSourceService() {
        return sourceService;
    }

    public void setSourceService(String sourceService) {
        this.sourceService = sourceService;
    }

    public Integer getSucursalId() {
        return sucursalId;
    }

    public void setSucursalId(Integer sucursalId) {
        this.sucursalId = sucursalId;
    }

    public Payload getPayload() {
        return payload;
    }

    public void setPayload(Payload payload) {
        this.payload = payload;
    }
}
