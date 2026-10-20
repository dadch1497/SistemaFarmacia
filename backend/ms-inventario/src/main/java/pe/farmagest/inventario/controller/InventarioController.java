package pe.farmagest.inventario.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.inventario.dto.*;
import pe.farmagest.inventario.security.JwtAuthenticationFilter.UserPrincipal;
import pe.farmagest.inventario.service.InventarioService;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@Tag(name = "Inventario y FEFO", description = "Operaciones de stock por lote, control FEFO, alertas de vencimiento y kardex")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping("/stock")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR')")
    @Operation(summary = "Consultar inventario consolidado de la sucursal")
    public ResponseEntity<List<StockProductoResponse>> listarStock(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(inventarioService.listarStock(sucursalId));
    }

    @GetMapping("/stock/producto/{productoId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR')")
    @Operation(summary = "Consultar existencia consolidada de un producto")
    public ResponseEntity<StockProductoResponse> obtenerStockPorProducto(
            @PathVariable Long productoId,
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(inventarioService.obtenerStockPorProducto(productoId, sucursalId));
    }

    @GetMapping("/stock-bajo")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar productos con existencias por debajo o igual al stock mínimo")
    public ResponseEntity<List<StockProductoResponse>> listarStockBajo(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(inventarioService.listarStockBajo(sucursalId));
    }

    @GetMapping("/lotes/producto/{productoId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar lotes ordenados por FEFO para un producto")
    public ResponseEntity<List<LoteResponse>> listarLotesPorProducto(
            @PathVariable Long productoId,
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId,
            Authentication authentication
    ) {
        List<LoteResponse> lotes = inventarioService.listarLotesPorProducto(productoId, sucursalId);
        sanitizarCostosSiVendedor(lotes, authentication);
        return ResponseEntity.ok(lotes);
    }

    @GetMapping("/lotes/por-vencer")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar lotes próximos a vencer dentro del horizonte de días (30, 60, 90)")
    public ResponseEntity<List<LoteResponse>> listarLotesPorVencer(
            @RequestParam(name = "dias", defaultValue = "30") int dias,
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId,
            Authentication authentication
    ) {
        List<LoteResponse> lotes = inventarioService.listarLotesPorVencer(dias, sucursalId);
        sanitizarCostosSiVendedor(lotes, authentication);
        return ResponseEntity.ok(lotes);
    }

    @PostMapping("/ajustes")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Registrar ajuste de inventario o merma (Rotura, Vencimiento, Sobrante)")
    public ResponseEntity<KardexResponse> registrarAjuste(
            @Valid @RequestBody AjusteStockRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        KardexResponse res = inventarioService.registrarAjuste(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/salida-fefo")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR')")
    @Operation(summary = "Ejecutar despacho de existencias bajo algoritmo FEFO")
    public ResponseEntity<DespachoFefoRequest.DespachoResult> despacharFefo(
            @Valid @RequestBody DespachoFefoRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        DespachoFefoRequest.DespachoResult res = inventarioService.despacharFefo(request, usuarioId);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/kardex/producto/{productoId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Historial cronológico de movimientos kardex de un producto")
    public ResponseEntity<List<KardexResponse>> listarKardex(
            @PathVariable Long productoId,
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(inventarioService.listarKardexPorProducto(productoId, sucursalId));
    }

    @GetMapping("/alertas")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar alertas activas no atendidas de inventario")
    public ResponseEntity<List<AlertaResponse>> listarAlertas(
            @RequestParam(name = "sucursalId", defaultValue = "1") Integer sucursalId
    ) {
        return ResponseEntity.ok(inventarioService.listarAlertas(sucursalId));
    }

    @PatchMapping("/alertas/{id}/atender")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_ALMACENERO')")
    @Operation(summary = "Marcar una alerta como atendida")
    public ResponseEntity<Void> atenderAlerta(@PathVariable Long id) {
        inventarioService.atenderAlerta(id);
        return ResponseEntity.noContent().build();
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        return 1L;
    }

    private void sanitizarCostosSiVendedor(List<LoteResponse> lotes, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            boolean esAdminOAlmacenero = principal.getRoles().contains("ROLE_ADMINISTRADOR")
                    || principal.getRoles().contains("ROLE_ALMACENERO");
            if (!esAdminOAlmacenero) {
                for (LoteResponse l : lotes) {
                    l.setCostoUnitario(null);
                }
            }
        }
    }
}
