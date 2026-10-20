package pe.farmagest.catalogo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.catalogo.dto.CategoriaDto;
import pe.farmagest.catalogo.service.CategoriaService;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo/categorias")
@Tag(name = "Categorías", description = "Consulta de categorías de productos farmacéuticos")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las categorías activas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<List<CategoriaDto>> listar() {
        return ResponseEntity.ok(categoriaService.listarActivas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<CategoriaDto> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(categoriaService.obtenerPorId(id));
    }
}
