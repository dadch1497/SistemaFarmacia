package pe.farmagest.ventas.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.ventas.dto.AperturaCajaRequest;
import pe.farmagest.ventas.dto.CierreCajaRequest;
import pe.farmagest.ventas.dto.SesionCajaDto;
import pe.farmagest.ventas.entity.Caja;
import pe.farmagest.ventas.entity.EstadoSesionCaja;
import pe.farmagest.ventas.entity.EstadoVenta;
import pe.farmagest.ventas.entity.MedioPago;
import pe.farmagest.ventas.entity.SesionCaja;
import pe.farmagest.ventas.entity.Venta;
import pe.farmagest.ventas.repository.CajaRepository;
import pe.farmagest.ventas.repository.SesionCajaRepository;
import pe.farmagest.ventas.repository.VentaRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CajaService {

    private final CajaRepository cajaRepository;
    private final SesionCajaRepository sesionCajaRepository;
    private final VentaRepository ventaRepository;

    public CajaService(CajaRepository cajaRepository,
                       SesionCajaRepository sesionCajaRepository,
                       VentaRepository ventaRepository) {
        this.cajaRepository = cajaRepository;
        this.sesionCajaRepository = sesionCajaRepository;
        this.ventaRepository = ventaRepository;
    }

    public List<Caja> listarCajas(Integer sucursalId) {
        return cajaRepository.findBySucursalIdAndActivoTrue(sucursalId);
    }

    public SesionCajaDto obtenerTurnoActivo(Long usuarioId, Integer sucursalId) {
        return sesionCajaRepository.findFirstByUsuarioIdAndSucursalIdAndEstado(usuarioId, sucursalId, EstadoSesionCaja.ABIERTA)
                .map(this::mapearADtoConResumenVentas)
                .orElse(null);
    }

    @Transactional
    public SesionCajaDto aperturaCaja(AperturaCajaRequest request, Long usuarioId) {
        Integer sucursalId = request.getSucursalId() != null ? request.getSucursalId() : 1;

        // Si el usuario ya tiene un turno abierto en esta sucursal, devolvemos su sesión activa
        var sesionUsuario = sesionCajaRepository.findFirstByUsuarioIdAndSucursalIdAndEstado(usuarioId, sucursalId, EstadoSesionCaja.ABIERTA);
        if (sesionUsuario.isPresent()) {
            return mapearADtoConResumenVentas(sesionUsuario.get());
        }

        // Validar si la caja física seleccionada ya está abierta por otro vendedor
        var sesionCajaFisica = sesionCajaRepository.findCajaAbierta(request.getCajaId());
        if (sesionCajaFisica.isPresent()) {
            SesionCaja abierta = sesionCajaFisica.get();
            if (abierta.getUsuarioId().equals(usuarioId)) {
                return mapearADtoConResumenVentas(abierta);
            } else {
                throw new IllegalStateException("La caja física '" + abierta.getCaja().getNombre() + "' ya está abierta por otro vendedor");
            }
        }

        Caja caja = cajaRepository.findById(request.getCajaId())
                .orElseThrow(() -> new IllegalArgumentException("Caja no encontrada con ID: " + request.getCajaId()));

        SesionCaja sesion = new SesionCaja();
        sesion.setCaja(caja);
        sesion.setUsuarioId(usuarioId);
        sesion.setSucursalId(sucursalId);
        sesion.setMontoApertura(request.getMontoApertura());
        sesion.setEstado(EstadoSesionCaja.ABIERTA);
        sesion.setFechaApertura(LocalDateTime.now());
        sesion.setObservaciones(request.getObservaciones());

        SesionCaja guardada = sesionCajaRepository.save(sesion);
        return mapearADtoConResumenVentas(guardada);
    }

    @Transactional
    public SesionCajaDto cierreCaja(Long sesionId, CierreCajaRequest request, Long usuarioId, boolean esAdmin) {
        SesionCaja sesion = sesionCajaRepository.findById(sesionId)
                .orElseThrow(() -> new IllegalArgumentException("Sesión de caja no encontrada con ID: " + sesionId));

        if (sesion.getEstado() != EstadoSesionCaja.ABIERTA) {
            throw new IllegalStateException("La sesión de caja ya se encuentra cerrada");
        }

        if (!esAdmin && !sesion.getUsuarioId().equals(usuarioId)) {
            throw new SecurityException("No tiene permisos para cerrar la sesión de caja de otro vendedor");
        }

        // Calcular totales de ventas en el turno
        List<Venta> ventasTurno = ventaRepository.findBySesionCajaIdOrderByFechaHoraDesc(sesionId).stream()
                .filter(v -> v.getEstado() == EstadoVenta.COMPLETADA)
                .toList();

        BigDecimal ventasEfectivo = BigDecimal.ZERO;
        BigDecimal ventasTarjeta = BigDecimal.ZERO;
        BigDecimal ventasBilletera = BigDecimal.ZERO;
        BigDecimal ventasGeneral = BigDecimal.ZERO;

        for (Venta v : ventasTurno) {
            ventasGeneral = ventasGeneral.add(v.getTotal());
            if (v.getMedioPago() == MedioPago.EFECTIVO) {
                ventasEfectivo = ventasEfectivo.add(v.getTotal());
            } else if (v.getMedioPago() == MedioPago.TARJETA) {
                ventasTarjeta = ventasTarjeta.add(v.getTotal());
            } else if (v.getMedioPago() == MedioPago.YAPE_PLIN) {
                ventasBilletera = ventasBilletera.add(v.getTotal());
            }
        }

        // El dinero en efectivo que debería haber en caja = monto inicial + ventas en efectivo
        BigDecimal montoCierreSistema = sesion.getMontoApertura().add(ventasEfectivo);
        BigDecimal diferencia = request.getMontoCierreReal().subtract(montoCierreSistema);

        sesion.setMontoCierreSistema(montoCierreSistema);
        sesion.setMontoCierreReal(request.getMontoCierreReal());
        sesion.setDiferencia(diferencia);
        sesion.setEstado(EstadoSesionCaja.CERRADA);
        sesion.setFechaCierre(LocalDateTime.now());
        if (request.getObservaciones() != null) {
            sesion.setObservaciones((sesion.getObservaciones() != null ? sesion.getObservaciones() + " | " : "") + request.getObservaciones());
        }

        SesionCaja guardada = sesionCajaRepository.save(sesion);
        SesionCajaDto dto = mapearADtoConResumenVentas(guardada);
        dto.setTotalVentasEfectivo(ventasEfectivo);
        dto.setTotalVentasTarjeta(ventasTarjeta);
        dto.setTotalVentasBilletera(ventasBilletera);
        dto.setTotalVentasGeneral(ventasGeneral);
        dto.setCantidadTransacciones(ventasTurno.size());
        return dto;
    }

    public List<SesionCajaDto> listarSesiones(Integer sucursalId, Long usuarioId, boolean esAdmin) {
        List<SesionCaja> lista;
        if (esAdmin) {
            lista = sesionCajaRepository.findBySucursalIdOrderByFechaAperturaDesc(sucursalId);
        } else {
            lista = sesionCajaRepository.findByUsuarioIdAndSucursalIdOrderByFechaAperturaDesc(usuarioId, sucursalId);
        }
        return lista.stream().map(this::mapearADtoConResumenVentas).collect(Collectors.toList());
    }

    private SesionCajaDto mapearADtoConResumenVentas(SesionCaja sesion) {
        SesionCajaDto dto = new SesionCajaDto();
        dto.setId(sesion.getId());
        dto.setCajaId(sesion.getCaja().getId());
        dto.setNombreCaja(sesion.getCaja().getNombre());
        dto.setCodigoCaja(sesion.getCaja().getCodigo());
        dto.setUsuarioId(sesion.getUsuarioId());
        dto.setSucursalId(sesion.getSucursalId());
        dto.setMontoApertura(sesion.getMontoApertura());
        dto.setMontoCierreSistema(sesion.getMontoCierreSistema());
        dto.setMontoCierreReal(sesion.getMontoCierreReal());
        dto.setDiferencia(sesion.getDiferencia());
        dto.setEstado(sesion.getEstado());
        dto.setFechaApertura(sesion.getFechaApertura());
        dto.setFechaCierre(sesion.getFechaCierre());
        dto.setObservaciones(sesion.getObservaciones());

        // Resumen calculado de ventas
        List<Venta> ventas = ventaRepository.findBySesionCajaIdOrderByFechaHoraDesc(sesion.getId()).stream()
                .filter(v -> v.getEstado() == EstadoVenta.COMPLETADA)
                .toList();

        BigDecimal efectivo = BigDecimal.ZERO;
        BigDecimal tarjeta = BigDecimal.ZERO;
        BigDecimal billetera = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;

        for (Venta v : ventas) {
            total = total.add(v.getTotal());
            if (v.getMedioPago() == MedioPago.EFECTIVO) efectivo = efectivo.add(v.getTotal());
            else if (v.getMedioPago() == MedioPago.TARJETA) tarjeta = tarjeta.add(v.getTotal());
            else if (v.getMedioPago() == MedioPago.YAPE_PLIN) billetera = billetera.add(v.getTotal());
        }

        dto.setTotalVentasEfectivo(efectivo);
        dto.setTotalVentasTarjeta(tarjeta);
        dto.setTotalVentasBilletera(billetera);
        dto.setTotalVentasGeneral(total);
        dto.setCantidadTransacciones(ventas.size());

        return dto;
    }
}
