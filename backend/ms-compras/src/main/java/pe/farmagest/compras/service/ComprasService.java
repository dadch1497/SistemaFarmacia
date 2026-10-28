package pe.farmagest.compras.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.compras.dto.*;
import pe.farmagest.compras.entity.*;
import pe.farmagest.compras.event.ComprasEventPublisher;
import pe.farmagest.compras.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComprasService {

    private final OrdenCompraRepository ordenCompraRepository;
    private final DetalleOrdenCompraRepository detalleOrdenCompraRepository;
    private final IngresoMercaderiaRepository ingresoRepository;
    private final DetalleIngresoRepository detalleIngresoRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProveedorService proveedorService;
    private final ComprasEventPublisher eventPublisher;
    private final GuiaDocumentoService guias;

    public ComprasService(
            OrdenCompraRepository ordenCompraRepository,
            DetalleOrdenCompraRepository detalleOrdenCompraRepository,
            IngresoMercaderiaRepository ingresoRepository,
            DetalleIngresoRepository detalleIngresoRepository,
            ProveedorRepository proveedorRepository,
            ProveedorService proveedorService,
            ComprasEventPublisher eventPublisher,
            GuiaDocumentoService guias
    ) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.detalleOrdenCompraRepository = detalleOrdenCompraRepository;
        this.ingresoRepository = ingresoRepository;
        this.detalleIngresoRepository = detalleIngresoRepository;
        this.proveedorRepository = proveedorRepository;
        this.proveedorService = proveedorService;
        this.eventPublisher = eventPublisher;
        this.guias = guias;
    }

    public List<OrdenCompraDto> listarOrdenes(Integer sucursalId) {
        return ordenCompraRepository.findBySucursalIdOrderByFechaEmisionDesc(sucursalId).stream()
                .map(this::mapToOrdenDto)
                .collect(Collectors.toList());
    }

    public OrdenCompraDto obtenerOrdenPorId(Long id) {
        OrdenCompra oc = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden de compra no encontrada con ID: " + id));
        return mapToOrdenDto(oc);
    }

    @Transactional
    public OrdenCompraDto crearOrden(CrearOrdenCompraRequest req, Long usuarioId) {
        Proveedor prov = proveedorRepository.findById(req.getProveedorId())
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + req.getProveedorId()));

        OrdenCompra oc = new OrdenCompra();
        oc.setNumeroOrden("OC-" + System.currentTimeMillis() % 1000000);
        oc.setProveedor(prov);
        oc.setSucursalId(req.getSucursalId() != null ? req.getSucursalId() : 1);
        oc.setEstado(EstadoOrden.PENDIENTE);
        oc.setUsuarioCreadorId(usuarioId);
        oc.setFechaEsperada(req.getFechaEsperada());
        oc.setObservaciones(req.getObservaciones());

        for (CrearOrdenCompraRequest.ItemOrdenRequest item : req.getItems()) {
            DetalleOrdenCompra det = new DetalleOrdenCompra(
                    item.getProductoId(),
                    item.getCantidadSolicitada(),
                    item.getCostoPactado()
            );
            oc.addDetalle(det);
        }

        oc.calcularTotales();
        oc = ordenCompraRepository.save(oc);
        return mapToOrdenDto(oc);
    }

    @Transactional
    public OrdenCompraDto cambiarEstadoOrden(Long id, EstadoOrden nuevoEstado) {
        OrdenCompra oc = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden de compra no encontrada con ID: " + id));

        oc.setEstado(nuevoEstado);
        oc = ordenCompraRepository.save(oc);
        return mapToOrdenDto(oc);
    }

    public List<IngresoMercaderiaDto> listarIngresos(Integer sucursalId) {
        return ingresoRepository.findBySucursalIdOrderByFechaRecepcionDesc(sucursalId).stream()
                .map(this::mapToIngresoDto)
                .collect(Collectors.toList());
    }

    public IngresoMercaderiaDto obtenerIngresoPorId(Long id) {
        IngresoMercaderia ing = ingresoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ingreso no encontrado con ID: " + id));
        return mapToIngresoDto(ing);
    }

    /**
     * Registro de recepción física de mercadería y publicación a RabbitMQ
     */
    @Transactional
    public IngresoMercaderiaDto registrarIngreso(RegistrarIngresoRequest req, Long usuarioId) {
        return crearIngreso(req, usuarioId, null);
    }

    @Transactional
    public IngresoMercaderiaDto registrarIngresoConGuia(RegistrarIngresoRequest req, Long usuarioId, org.springframework.web.multipart.MultipartFile archivo) {
        return crearIngreso(req, usuarioId, guias.validar(archivo));
    }

    private IngresoMercaderiaDto crearIngreso(RegistrarIngresoRequest req, Long usuarioId, GuiaDocumento guia) {
        IngresoMercaderia ingreso = new IngresoMercaderia();
        ingreso.setNumeroGuia(req.getNumeroGuia());
        ingreso.setNumeroFacturaProveedor(req.getNumeroFacturaProveedor());
        ingreso.setSucursalId(req.getSucursalId() != null ? req.getSucursalId() : 1);
        ingreso.setUsuarioRecepcionId(usuarioId);
        ingreso.setObservaciones(req.getObservaciones());

        if (req.getOrdenCompraId() != null) {
            java.util.Optional<OrdenCompra> ocOpt = ordenCompraRepository.findById(req.getOrdenCompraId());
            if (ocOpt.isPresent()) {
                OrdenCompra oc = ocOpt.get();
                ingreso.setOrdenCompra(oc);
                oc.setEstado(EstadoOrden.RECIBIDA_TOTAL);
                ordenCompraRepository.save(oc);
            }
        }

        for (RegistrarIngresoRequest.ItemIngresoRequest item : req.getItems()) {
            DetalleIngreso det = new DetalleIngreso(
                    item.getProductoId(),
                    item.getNumeroLote(),
                    item.getFechaVencimiento(),
                    item.getCantidadRecibida(),
                    item.getCostoUnitarioReal()
            );
            ingreso.addDetalle(det);
        }

        ingreso = ingresoRepository.save(ingreso);
        if (guia != null) guias.guardar(ingreso.getId(), guia);

        // Publicar evento en RabbitMQ para que ms-inventario sume lotes y stock
        eventPublisher.emitirIngresoRegistrado(ingreso);

        return mapToIngresoDto(ingreso);
    }

    private OrdenCompraDto mapToOrdenDto(OrdenCompra oc) {
        OrdenCompraDto dto = new OrdenCompraDto();
        dto.setId(oc.getId());
        dto.setNumeroOrden(oc.getNumeroOrden());
        dto.setProveedor(proveedorService.mapToDto(oc.getProveedor()));
        dto.setSucursalId(oc.getSucursalId());
        dto.setEstado(oc.getEstado());
        dto.setSubtotal(oc.getSubtotal());
        dto.setIgv(oc.getIgv());
        dto.setTotal(oc.getTotal());
        dto.setUsuarioCreadorId(oc.getUsuarioCreadorId());
        dto.setFechaEmision(oc.getFechaEmision());
        dto.setFechaEsperada(oc.getFechaEsperada());
        dto.setObservaciones(oc.getObservaciones());

        dto.setDetalles(oc.getDetalles().stream().map(d -> new DetalleOrdenDto(
                d.getId(),
                d.getProductoId(),
                d.getCantidadSolicitada(),
                d.getCostoPactado(),
                d.getSubtotal()
        )).collect(Collectors.toList()));

        return dto;
    }

    private IngresoMercaderiaDto mapToIngresoDto(IngresoMercaderia ing) {
        IngresoMercaderiaDto dto = new IngresoMercaderiaDto();
        dto.setId(ing.getId());
        dto.setNumeroGuia(ing.getNumeroGuia());
        dto.setTieneGuiaAdjunta(guias.tiene(ing.getId()));
        dto.setNumeroFacturaProveedor(ing.getNumeroFacturaProveedor());
        dto.setOrdenCompraId(ing.getOrdenCompra() != null ? ing.getOrdenCompra().getId() : null);
        dto.setNumeroOrdenCompra(ing.getOrdenCompra() != null ? ing.getOrdenCompra().getNumeroOrden() : null);
        dto.setSucursalId(ing.getSucursalId());
        dto.setUsuarioRecepcionId(ing.getUsuarioRecepcionId());
        dto.setFechaRecepcion(ing.getFechaRecepcion());
        dto.setObservaciones(ing.getObservaciones());

        dto.setDetalles(ing.getDetalles().stream().map(d -> new DetalleIngresoDto(
                d.getId(),
                d.getProductoId(),
                d.getNumeroLote(),
                d.getFechaVencimiento(),
                d.getCantidadRecibida(),
                d.getCostoUnitarioReal()
        )).collect(Collectors.toList()));

        return dto;
    }
}
