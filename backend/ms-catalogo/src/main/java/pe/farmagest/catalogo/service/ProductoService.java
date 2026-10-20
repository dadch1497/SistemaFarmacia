package pe.farmagest.catalogo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.catalogo.dto.*;
import pe.farmagest.catalogo.entity.Categoria;
import pe.farmagest.catalogo.entity.HistorialPrecio;
import pe.farmagest.catalogo.entity.Laboratorio;
import pe.farmagest.catalogo.entity.Producto;
import pe.farmagest.catalogo.event.CatalogoEventPublisher;
import pe.farmagest.catalogo.event.PrecioCambiadoEvent;
import pe.farmagest.catalogo.repository.CategoriaRepository;
import pe.farmagest.catalogo.repository.HistorialPrecioRepository;
import pe.farmagest.catalogo.repository.LaboratorioRepository;
import pe.farmagest.catalogo.repository.ProductoRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final LaboratorioRepository laboratorioRepository;
    private final HistorialPrecioRepository historialPrecioRepository;
    private final CatalogoEventPublisher eventPublisher;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaRepository categoriaRepository,
                           LaboratorioRepository laboratorioRepository,
                           HistorialPrecioRepository historialPrecioRepository,
                           CatalogoEventPublisher eventPublisher) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.laboratorioRepository = laboratorioRepository;
        this.historialPrecioRepository = historialPrecioRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Page<ProductoDto> buscarProductos(String query,
                                             Integer categoriaId,
                                             Boolean requiereReceta,
                                             Boolean activo,
                                             Pageable pageable,
                                             boolean esAdmin) {
        return productoRepository.buscarProductos(query, categoriaId, requiereReceta, activo, pageable)
                .map(p -> mapearADto(p, esAdmin));
    }

    @Transactional(readOnly = true)
    public ProductoDto obtenerPorId(Long id, boolean esAdmin) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con ID: " + id));
        return mapearADto(producto, esAdmin);
    }

    @Transactional(readOnly = true)
    public ProductoDto obtenerPorCodigoBarras(String codigoBarras, boolean esAdmin) {
        Producto producto = productoRepository.findByCodigoBarras(codigoBarras)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con código de barras: " + codigoBarras));
        return mapearADto(producto, esAdmin);
    }

    @Transactional
    public ProductoDto crearProducto(CrearProductoRequest request) {
        if (productoRepository.existsByCodigoBarras(request.getCodigoBarras())) {
            throw new IllegalArgumentException("Ya existe un producto con el código de barras: " + request.getCodigoBarras());
        }

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada con ID: " + request.getCategoriaId()));

        Laboratorio laboratorio = laboratorioRepository.findById(request.getLaboratorioId())
                .orElseThrow(() -> new NoSuchElementException("Laboratorio no encontrado con ID: " + request.getLaboratorioId()));

        Producto producto = new Producto();
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setNombre(request.getNombre());
        producto.setPrincipioActivo(request.getPrincipioActivo());
        producto.setConcentracion(request.getConcentracion());
        producto.setPresentacion(request.getPresentacion());
        producto.setCategoria(categoria);
        producto.setLaboratorio(laboratorio);
        producto.setPrecioVenta(request.getPrecioVenta());
        producto.setPrecioCosto(request.getPrecioCosto());
        producto.setRequiereReceta(request.getRequiereReceta() != null ? request.getRequiereReceta() : false);
        producto.setActivo(true);

        Producto guardado = productoRepository.save(producto);
        return mapearADto(guardado, true);
    }

    @Transactional
    public ProductoDto actualizarProducto(Long id, ActualizarProductoRequest request, Long usuarioId, String username) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con ID: " + id));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada con ID: " + request.getCategoriaId()));

        Laboratorio laboratorio = laboratorioRepository.findById(request.getLaboratorioId())
                .orElseThrow(() -> new NoSuchElementException("Laboratorio no encontrado con ID: " + request.getLaboratorioId()));

        // Verificar si hubo cambio de precio o costo para registrar historial y evento
        boolean cambioPrecio = producto.getPrecioVenta().compareTo(request.getPrecioVenta()) != 0 ||
                               producto.getPrecioCosto().compareTo(request.getPrecioCosto()) != 0;

        if (cambioPrecio) {
            registrarHistorialYPublicarEvento(
                    producto,
                    producto.getPrecioVenta(),
                    request.getPrecioVenta(),
                    producto.getPrecioCosto(),
                    request.getPrecioCosto(),
                    usuarioId,
                    username,
                    request.getMotivoCambio() != null ? request.getMotivoCambio() : "Actualización general de producto"
            );
        }

        producto.setNombre(request.getNombre());
        producto.setPrincipioActivo(request.getPrincipioActivo());
        producto.setConcentracion(request.getConcentracion());
        producto.setPresentacion(request.getPresentacion());
        producto.setCategoria(categoria);
        producto.setLaboratorio(laboratorio);
        producto.setPrecioVenta(request.getPrecioVenta());
        producto.setPrecioCosto(request.getPrecioCosto());

        if (request.getRequiereReceta() != null) {
            producto.setRequiereReceta(request.getRequiereReceta());
        }
        if (request.getActivo() != null) {
            producto.setActivo(request.getActivo());
        }

        Producto actualizado = productoRepository.save(producto);
        return mapearADto(actualizado, true);
    }

    @Transactional
    public ProductoDto cambiarPrecio(Long id, CambiarPrecioRequest request, Long usuarioId, String username) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con ID: " + id));

        BigDecimal precioAnterior = producto.getPrecioVenta();
        BigDecimal costoAnterior = producto.getPrecioCosto();
        BigDecimal precioNuevo = request.getNuevoPrecioVenta();
        BigDecimal costoNuevo = request.getNuevoPrecioCosto() != null ? request.getNuevoPrecioCosto() : costoAnterior;

        registrarHistorialYPublicarEvento(
                producto,
                precioAnterior,
                precioNuevo,
                costoAnterior,
                costoNuevo,
                usuarioId,
                username,
                request.getMotivo()
        );

        producto.setPrecioVenta(precioNuevo);
        producto.setPrecioCosto(costoNuevo);

        Producto actualizado = productoRepository.save(producto);
        return mapearADto(actualizado, true);
    }

    @Transactional
    public void darDeBaja(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado con ID: " + id));
        producto.setActivo(false); // Baja lógica
        productoRepository.save(producto);
    }

    @Transactional(readOnly = true)
    public List<HistorialPrecioDto> obtenerHistorialPrecios(Long productoId) {
        return historialPrecioRepository.findByProductoIdOrderByFechaCambioDesc(productoId).stream()
                .map(h -> {
                    HistorialPrecioDto dto = new HistorialPrecioDto();
                    dto.setId(h.getId());
                    dto.setProductoId(h.getProducto().getId());
                    dto.setNombreProducto(h.getProducto().getNombre());
                    dto.setPrecioAnterior(h.getPrecioAnterior());
                    dto.setPrecioNuevo(h.getPrecioNuevo());
                    dto.setCostoAnterior(h.getCostoAnterior());
                    dto.setCostoNuevo(h.getCostoNuevo());
                    dto.setMotivo(h.getMotivo());
                    dto.setUsuarioId(h.getUsuarioId());
                    dto.setFechaCambio(h.getFechaCambio());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private void registrarHistorialYPublicarEvento(Producto producto,
                                                   BigDecimal precioAnterior,
                                                   BigDecimal precioNuevo,
                                                   BigDecimal costoAnterior,
                                                   BigDecimal costoNuevo,
                                                   Long usuarioId,
                                                   String username,
                                                   String motivo) {
        // 1. Guardar en tabla historial_precio
        HistorialPrecio historial = new HistorialPrecio();
        historial.setProducto(producto);
        historial.setPrecioAnterior(precioAnterior);
        historial.setPrecioNuevo(precioNuevo);
        historial.setCostoAnterior(costoAnterior);
        historial.setCostoNuevo(costoNuevo);
        historial.setMotivo(motivo);
        historial.setUsuarioId(usuarioId != null ? usuarioId : 1L);
        historialPrecioRepository.save(historial);

        // 2. Publicar evento a RabbitMQ para ms-reportes (auditoría)
        PrecioCambiadoEvent.Payload payload = new PrecioCambiadoEvent.Payload();
        payload.setProductoId(producto.getId());
        payload.setNombreProducto(producto.getNombre());
        payload.setPrecioVentaAnterior(precioAnterior);
        payload.setPrecioVentaNuevo(precioNuevo);
        payload.setPrecioCostoAnterior(costoAnterior);
        payload.setPrecioCostoNuevo(costoNuevo);
        payload.setUsuarioId(usuarioId != null ? usuarioId : 1L);
        payload.setUsername(username != null ? username : "admin");
        payload.setMotivo(motivo);
        payload.setFechaHora(Instant.now().toString());

        PrecioCambiadoEvent event = new PrecioCambiadoEvent(payload);
        eventPublisher.publicarPrecioCambiado(event);
    }

    public ProductoDto mapearADto(Producto p, boolean esAdmin) {
        ProductoDto dto = new ProductoDto();
        dto.setId(p.getId());
        dto.setCodigoBarras(p.getCodigoBarras());
        dto.setNombre(p.getNombre());
        dto.setPrincipioActivo(p.getPrincipioActivo());
        dto.setConcentracion(p.getConcentracion());
        dto.setPresentacion(p.getPresentacion());
        dto.setPrecioVenta(p.getPrecioVenta());
        dto.setRequiereReceta(p.getRequiereReceta());
        dto.setActivo(p.getActivo());
        dto.setCreadoEn(p.getCreadoEn());

        if (p.getCategoria() != null) {
            dto.setCategoria(new CategoriaDto(p.getCategoria().getId(), p.getCategoria().getNombre(), p.getCategoria().getDescripcion(), p.getCategoria().getActivo()));
        }
        if (p.getLaboratorio() != null) {
            dto.setLaboratorio(new LaboratorioDto(p.getLaboratorio().getId(), p.getLaboratorio().getNombre(), p.getLaboratorio().getPaisOrigen(), p.getLaboratorio().getActivo()));
        }

        // SEGURIDAD: Solo el Administrador ve costos y margen
        if (esAdmin) {
            dto.setPrecioCosto(p.getPrecioCosto());
            if (p.getPrecioVenta() != null && p.getPrecioVenta().compareTo(BigDecimal.ZERO) > 0 && p.getPrecioCosto() != null) {
                BigDecimal margen = p.getPrecioVenta().subtract(p.getPrecioCosto())
                        .divide(p.getPrecioVenta(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
                dto.setMargenPorcentaje(margen);
            }
        } else {
            dto.setPrecioCosto(null);
            dto.setMargenPorcentaje(null);
        }

        return dto;
    }
}
