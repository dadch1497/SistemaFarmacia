package pe.farmagest.catalogo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.catalogo.dto.*;
import pe.farmagest.catalogo.security.JwtAuthenticationFilter.UserPrincipal;
import pe.farmagest.catalogo.service.ProductoService;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo/productos")
@Tag(name = "Productos", description = "Gestión de catálogo farmacéutico, precios e historial")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @Operation(summary = "Buscar productos con paginación, filtros y ocultación de costos para vendedores")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<Page<ProductoDto>> buscar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer categoriaId,
            @RequestParam(required = false) Boolean requiereReceta,
            @RequestParam(required = false) Boolean activo,
            @PageableDefault(size = 10, sort = "nombre") Pageable pageable,
            Authentication authentication
    ) {
        boolean esAdmin = esAdministrador(authentication);
        Page<ProductoDto> resultado = productoService.buscarProductos(q, categoriaId, requiereReceta, activo, pageable, esAdmin);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar el detalle de un producto por ID")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<ProductoDto> obtenerPorId(@PathVariable Long id, Authentication authentication) {
        boolean esAdmin = esAdministrador(authentication);
        ProductoDto dto = productoService.obtenerPorId(id, esAdmin);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/codigo/{codigoBarras}")
    @Operation(summary = "Consultar producto por código de barras (para escáner de mostrador POS)")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<ProductoDto> obtenerPorCodigoBarras(
            @PathVariable String codigoBarras,
            Authentication authentication
    ) {
        boolean esAdmin = esAdministrador(authentication);
        ProductoDto dto = productoService.obtenerPorCodigoBarras(codigoBarras, esAdmin);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @Operation(summary = "Crear nuevo producto (Exclusivo Administrador)")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ProductoDto> crear(@Valid @RequestBody CrearProductoRequest request) {
        ProductoDto creado = productoService.crearProducto(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar completo de un producto (Exclusivo Administrador)")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ProductoDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarProductoRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        String username = authentication != null ? authentication.getName() : "admin";
        ProductoDto actualizado = productoService.actualizarProducto(id, request, usuarioId, username);
        return ResponseEntity.ok(actualizado);
    }

    @PatchMapping("/{id}/precio")
    @Operation(summary = "Cambio específico de precio con motivo y evento RabbitMQ (Exclusivo Administrador)")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ProductoDto> cambiarPrecio(
            @PathVariable Long id,
            @Valid @RequestBody CambiarPrecioRequest request,
            Authentication authentication
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        String username = authentication != null ? authentication.getName() : "admin";
        ProductoDto actualizado = productoService.cambiarPrecio(id, request, usuarioId, username);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Baja lógica del producto (Exclusivo Administrador)")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
        productoService.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historial-precios")
    @Operation(summary = "Consultar historial de variaciones de precio y costos (Exclusivo Administrador)")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<HistorialPrecioDto>> obtenerHistorialPrecios(@PathVariable Long id) {
        List<HistorialPrecioDto> historial = productoService.obtenerHistorialPrecios(id);
        return ResponseEntity.ok(historial);
    }

    private boolean esAdministrador(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMINISTRADOR"));
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) authentication.getPrincipal()).getUserId();
        }
        return 1L;
    }
}
