package pe.farmagest.ventas.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.ventas.dto.CrearPromocionRequest;
import pe.farmagest.ventas.dto.PromocionDto;
import pe.farmagest.ventas.dto.ValidarCuponRequest;
import pe.farmagest.ventas.dto.ValidarCuponResponse;
import pe.farmagest.ventas.entity.Cupon;
import pe.farmagest.ventas.entity.Promocion;
import pe.farmagest.ventas.repository.CuponRepository;
import pe.farmagest.ventas.repository.PromocionRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PromocionService {

    private final PromocionRepository promocionRepository;
    private final CuponRepository cuponRepository;

    public PromocionService(PromocionRepository promocionRepository, CuponRepository cuponRepository) {
        this.promocionRepository = promocionRepository;
        this.cuponRepository = cuponRepository;
    }

    public List<PromocionDto> listarTodasPromociones() {
        return promocionRepository.findAll().stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PromocionDto crearPromocion(CrearPromocionRequest request) {
        Promocion p = new Promocion();
        p.setNombre(request.getNombre().trim());
        p.setTipoAlcance(request.getTipoAlcance());
        p.setTipoDescuento(request.getTipoDescuento());
        p.setValorDescuento(request.getValorDescuento());
        p.setCantidadCondicion(request.getCantidadCondicion());
        p.setCantidadPagada(request.getCantidadPagada());
        p.setFechaInicio(request.getFechaInicio());
        p.setFechaFin(request.getFechaFin());
        p.setAplicaPorVencimiento(request.getAplicaPorVencimiento() != null && request.getAplicaPorVencimiento());
        p.setActivo(true);

        Promocion guardada = promocionRepository.save(p);
        return mapearADto(guardada);
    }

    @Transactional
    public void cambiarEstadoPromocion(Long id, boolean activo) {
        promocionRepository.findById(id).ifPresent(p -> {
            p.setActivo(activo);
            promocionRepository.save(p);
        });
    }

    public List<PromocionDto> listarPromocionesVigentes() {
        return promocionRepository.findPromocionesVigentes(LocalDate.now()).stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    public ValidarCuponResponse validarCupon(ValidarCuponRequest request) {
        String codigo = request.getCodigo().trim().toUpperCase();
        Optional<Cupon> opt = cuponRepository.findByCodigoAndActivoTrue(codigo);

        if (opt.isEmpty()) {
            return ValidarCuponResponse.invalido("El cupón '" + codigo + "' no existe o no está activo.");
        }

        Cupon cupon = opt.get();

        if (cupon.getFechaExpiracion().isBefore(LocalDate.now())) {
            return ValidarCuponResponse.invalido("El cupón '" + codigo + "' ha expirado el " + cupon.getFechaExpiracion() + ".");
        }

        if (cupon.getUsosActuales() >= cupon.getUsosPermitidos()) {
            return ValidarCuponResponse.invalido("El cupón '" + codigo + "' alcanzó el límite máximo de usos permitidos.");
        }

        BigDecimal montoVenta = request.getMontoVenta() != null ? request.getMontoVenta() : BigDecimal.ZERO;
        BigDecimal descuentoCalculado = BigDecimal.ZERO;

        if (cupon.getPorcentajeDescuento() != null && cupon.getPorcentajeDescuento().compareTo(BigDecimal.ZERO) > 0) {
            descuentoCalculado = montoVenta.multiply(cupon.getPorcentajeDescuento())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if (cupon.getMontoFijoDescuento() != null && cupon.getMontoFijoDescuento().compareTo(BigDecimal.ZERO) > 0) {
            descuentoCalculado = cupon.getMontoFijoDescuento().min(montoVenta);
        }

        BigDecimal nuevoTotal = montoVenta.subtract(descuentoCalculado).max(BigDecimal.ZERO);

        ValidarCuponResponse resp = new ValidarCuponResponse();
        resp.setValido(true);
        resp.setCuponId(cupon.getId());
        resp.setCodigo(cupon.getCodigo());
        resp.setPorcentajeDescuento(cupon.getPorcentajeDescuento());
        resp.setMontoDescuentoCalculado(descuentoCalculado);
        resp.setNuevoTotal(nuevoTotal);
        resp.setMensaje("Cupón aplicado con éxito: " + cupon.getPorcentajeDescuento() + "% de descuento (S/ " + descuentoCalculado + ").");
        return resp;
    }

    @Transactional
    public void registrarUsoCupon(Long cuponId) {
        if (cuponId == null) return;
        cuponRepository.findById(cuponId).ifPresent(c -> {
            c.setUsosActuales(c.getUsosActuales() + 1);
            cuponRepository.save(c);
        });
    }

    public PromocionDto mapearADto(Promocion p) {
        PromocionDto dto = new PromocionDto();
        dto.setId(p.getId());
        dto.setNombre(p.getNombre());
        dto.setTipoAlcance(p.getTipoAlcance());
        dto.setTipoDescuento(p.getTipoDescuento());
        dto.setValorDescuento(p.getValorDescuento());
        dto.setCantidadCondicion(p.getCantidadCondicion());
        dto.setCantidadPagada(p.getCantidadPagada());
        dto.setFechaInicio(p.getFechaInicio());
        dto.setFechaFin(p.getFechaFin());
        dto.setAplicaPorVencimiento(p.getAplicaPorVencimiento());
        dto.setActivo(p.getActivo());
        return dto;
    }
}
