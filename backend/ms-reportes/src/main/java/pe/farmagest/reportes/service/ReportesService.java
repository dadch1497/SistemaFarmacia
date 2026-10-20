package pe.farmagest.reportes.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.reportes.dto.DashboardResponse;
import pe.farmagest.reportes.dto.LogAuditoriaDto;
import pe.farmagest.reportes.dto.VentaDiaSemanaDto;
import pe.farmagest.reportes.entity.LogAuditoria;
import pe.farmagest.reportes.entity.ResumenVentaDiaria;
import pe.farmagest.reportes.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class ReportesService {

    private final ResumenVentaDiariaRepository resumenVentaRepo;
    private final MetricaProductoDiariaRepository metricaProductoRepo;
    private final MetricaVendedorDiariaRepository metricaVendedorRepo;
    private final MetricaPagoDiariaRepository metricaPagoRepo;
    private final LogAuditoriaRepository logAuditoriaRepo;

    public ReportesService(ResumenVentaDiariaRepository resumenVentaRepo,
                           MetricaProductoDiariaRepository metricaProductoRepo,
                           MetricaVendedorDiariaRepository metricaVendedorRepo,
                           MetricaPagoDiariaRepository metricaPagoRepo,
                           LogAuditoriaRepository logAuditoriaRepo) {
        this.resumenVentaRepo = resumenVentaRepo;
        this.metricaProductoRepo = metricaProductoRepo;
        this.metricaVendedorRepo = metricaVendedorRepo;
        this.metricaPagoRepo = metricaPagoRepo;
        this.logAuditoriaRepo = logAuditoriaRepo;
    }

    @Transactional(readOnly = true)
    public DashboardResponse obtenerDashboard(String periodo, Integer sucursalId) {
        if (sucursalId == null) sucursalId = 1;
        if (periodo == null || periodo.isBlank()) periodo = "mes";

        LocalDate hoy = LocalDate.now();
        LocalDate desdeMes = hoy.withDayOfMonth(1);
        LocalDate hastaMes = hoy;

        LocalDate desdeAnio = hoy.withDayOfYear(1);

        // 1. KPIs
        DashboardResponse.KpisDto kpis = new DashboardResponse.KpisDto();

        // Ventas Hoy
        ResumenVentaDiaria resumenHoy = resumenVentaRepo.findBySucursalIdAndFecha(sucursalId, hoy)
                .orElse(new ResumenVentaDiaria(sucursalId, hoy));
        ResumenVentaDiaria resumenAyer = resumenVentaRepo.findBySucursalIdAndFecha(sucursalId, hoy.minusDays(1))
                .orElse(new ResumenVentaDiaria(sucursalId, hoy.minusDays(1)));

        double varHoy = 0.0;
        if (resumenAyer.getTotalVentas().compareTo(BigDecimal.ZERO) > 0) {
            varHoy = resumenHoy.getTotalVentas().subtract(resumenAyer.getTotalVentas())
                    .divide(resumenAyer.getTotalVentas(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }
        kpis.setVentasHoy(new DashboardResponse.VentasKpi(resumenHoy.getTotalVentas(), varHoy));

        // Ventas Mes y Utilidad Mes
        List<ResumenVentaDiaria> ventasMesList = resumenVentaRepo.findBySucursalIdAndFechaBetweenOrderByFechaAsc(sucursalId, desdeMes, hastaMes);
        BigDecimal totalVentasMes = ventasMesList.stream()
                .map(ResumenVentaDiaria::getTotalVentas)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalUtilidadMes = ventasMesList.stream()
                .map(ResumenVentaDiaria::getTotalUtilidad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double margenMes = 0.0;
        if (totalVentasMes.compareTo(BigDecimal.ZERO) > 0) {
            margenMes = totalUtilidadMes.divide(totalVentasMes, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        kpis.setVentasMes(new DashboardResponse.VentasKpi(totalVentasMes, 12.5));
        kpis.setUtilidadMes(new DashboardResponse.UtilidadKpi(totalUtilidadMes, margenMes));

        // Ventas Año
        List<ResumenVentaDiaria> ventasAnioList = resumenVentaRepo.findBySucursalIdAndFechaBetweenOrderByFechaAsc(sucursalId, desdeAnio, hoy);
        BigDecimal totalVentasAnio = ventasAnioList.stream()
                .map(ResumenVentaDiaria::getTotalVentas)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        kpis.setVentasAnio(new DashboardResponse.VentasKpi(totalVentasAnio, 8.2));

        // Ticket Promedio Hoy
        kpis.setTicketPromedio(new DashboardResponse.TicketPromedioKpi(
                resumenHoy.getTicketPromedio(),
                resumenHoy.getCantidadTransacciones()
        ));

        // 2. Ranking Productos más vendidos
        List<Object[]> topProdsRaw = metricaProductoRepo.findTopProductosVendidos(sucursalId, desdeMes, hastaMes);
        List<DashboardResponse.ProductoRankingDto> prods = new ArrayList<>();
        int rank = 1;
        for (Object[] r : topProdsRaw) {
            Long prodId = (Long) r[0];
            String nombre = (String) r[1];
            Number units = (Number) r[2];
            BigDecimal monto = (BigDecimal) r[3];
            prods.add(new DashboardResponse.ProductoRankingDto(rank++, prodId, nombre, units.intValue(), monto));
            if (rank > 5) break;
        }

        // 3. Ventas por Medio de Pago
        List<Object[]> pagosRaw = metricaPagoRepo.findResumenPorMedioPago(sucursalId, desdeMes, hastaMes);
        List<DashboardResponse.MedioPagoResumenDto> pagos = new ArrayList<>();
        BigDecimal totalPagos = BigDecimal.ZERO;
        for (Object[] r : pagosRaw) {
            totalPagos = totalPagos.add((BigDecimal) r[1]);
        }
        for (Object[] r : pagosRaw) {
            String medio = (String) r[0];
            BigDecimal monto = (BigDecimal) r[1];
            double pct = totalPagos.compareTo(BigDecimal.ZERO) > 0
                    ? monto.divide(totalPagos, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            pagos.add(new DashboardResponse.MedioPagoResumenDto(medio, pct, monto));
        }

        // 4. Ventas por Vendedor
        List<Object[]> vendedoresRaw = metricaVendedorRepo.findResumenPorVendedor(sucursalId, desdeMes, hastaMes);
        List<DashboardResponse.VendedorResumenDto> vendedores = new ArrayList<>();
        for (Object[] r : vendedoresRaw) {
            Long userId = (Long) r[0];
            String nom = (String) r[1];
            BigDecimal monto = (BigDecimal) r[2];
            Number cant = (Number) r[3];
            vendedores.add(new DashboardResponse.VendedorResumenDto(userId, nom, monto, cant.intValue()));
        }

        DashboardResponse resp = new DashboardResponse();
        resp.setPeriodo(periodo);
        resp.setKpis(kpis);
        resp.setProductosMasVendidos(prods);
        resp.setVentasPorMedioPago(pagos);
        resp.setVentasPorVendedor(vendedores);
        return resp;
    }

    @Transactional(readOnly = true)
    public List<VentaDiaSemanaDto> obtenerVentasPorDiaSemana(Integer sucursalId) {
        if (sucursalId == null) sucursalId = 1;
        LocalDate hoy = LocalDate.now();
        LocalDate hace4Semanas = hoy.minusDays(28);

        List<ResumenVentaDiaria> historial = resumenVentaRepo.findBySucursalIdAndFechaBetweenOrderByFechaAsc(sucursalId, hace4Semanas, hoy);

        Map<DayOfWeek, List<BigDecimal>> montosPorDia = new LinkedHashMap<>();
        for (DayOfWeek dow : DayOfWeek.values()) {
            montosPorDia.put(dow, new ArrayList<>());
        }

        for (ResumenVentaDiaria r : historial) {
            DayOfWeek dow = r.getFecha().getDayOfWeek();
            montosPorDia.get(dow).add(r.getTotalVentas());
        }

        List<VentaDiaSemanaDto> resultado = new ArrayList<>();
        BigDecimal maxPromedio = BigDecimal.ZERO;

        for (DayOfWeek dow : DayOfWeek.values()) {
            List<BigDecimal> montos = montosPorDia.get(dow);
            BigDecimal promedio = BigDecimal.ZERO;
            if (!montos.isEmpty()) {
                BigDecimal suma = montos.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                promedio = suma.divide(BigDecimal.valueOf(montos.size()), 2, RoundingMode.HALF_UP);
            }
            if (promedio.compareTo(maxPromedio) > 0) {
                maxPromedio = promedio;
            }
            String nombreDia = dow.getDisplayName(TextStyle.FULL, new Locale("es", "PE")).toUpperCase();
            resultado.add(new VentaDiaSemanaDto(nombreDia, promedio, false));
        }

        for (VentaDiaSemanaDto dto : resultado) {
            if (maxPromedio.compareTo(BigDecimal.ZERO) > 0 && dto.getMontoPromedio().compareTo(maxPromedio) == 0) {
                dto.setEsMayor(true);
            }
        }

        return resultado;
    }

    @Transactional(readOnly = true)
    public Page<LogAuditoriaDto> listarAuditoria(Integer sucursalId, Pageable pageable) {
        if (sucursalId == null) sucursalId = 1;
        return logAuditoriaRepo.findBySucursalIdOrderByFechaHoraDesc(sucursalId, pageable)
                .map(this::mapearAuditoriaADto);
    }

    private LogAuditoriaDto mapearAuditoriaADto(LogAuditoria a) {
        LogAuditoriaDto dto = new LogAuditoriaDto();
        dto.setId(a.getId());
        dto.setSucursalId(a.getSucursalId());
        dto.setUsuarioId(a.getUsuarioId());
        dto.setUsername(a.getUsername());
        dto.setRol(a.getRol());
        dto.setAccion(a.getAccion());
        dto.setEntidadAfectada(a.getEntidadAfectada());
        dto.setRegistroId(a.getRegistroId());
        dto.setValorAnterior(a.getValorAnterior());
        dto.setValorNuevo(a.getValorNuevo());
        dto.setIpOrigen(a.getIpOrigen());
        dto.setFechaHora(a.getFechaHora());
        return dto;
    }
}
