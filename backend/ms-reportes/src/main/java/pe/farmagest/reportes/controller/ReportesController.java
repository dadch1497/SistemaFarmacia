package pe.farmagest.reportes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.reportes.dto.DashboardResponse;
import pe.farmagest.reportes.dto.LogAuditoriaDto;
import pe.farmagest.reportes.dto.VentaDiaSemanaDto;
import pe.farmagest.reportes.service.ReportesService;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@Tag(name = "Reportes y Dashboard", description = "Endpoints para métricas de venta, KPIs, análisis por día de la semana y auditoría de eventos")
public class ReportesController {

    private final ReportesService reportesService;

    public ReportesController(ReportesService reportesService) {
        this.reportesService = reportesService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Obtener KPIs y métricas consolidadas del dashboard ejecutivo")
    public ResponseEntity<DashboardResponse> obtenerDashboard(
            @RequestParam(name = "periodo", defaultValue = "mes") String periodo,
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(reportesService.obtenerDashboard(periodo, sucursalId));
    }

    @GetMapping("/ventas/por-dia-semana")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Obtener comparativa de ventas promedio por día de la semana (últimas 4 semanas)")
    public ResponseEntity<List<VentaDiaSemanaDto>> obtenerVentasPorDiaSemana(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(reportesService.obtenerVentasPorDiaSemana(sucursalId));
    }

    @GetMapping("/auditoria")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    @Operation(summary = "Listar bitácora de auditoría inmutable de eventos sensibles")
    public ResponseEntity<Page<LogAuditoriaDto>> listarAuditoria(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reportesService.listarAuditoria(sucursalId, pageable));
    }
}
