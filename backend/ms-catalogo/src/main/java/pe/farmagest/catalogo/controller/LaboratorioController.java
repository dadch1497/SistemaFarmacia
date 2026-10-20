package pe.farmagest.catalogo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.catalogo.dto.LaboratorioDto;
import pe.farmagest.catalogo.service.LaboratorioService;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo/laboratorios")
@Tag(name = "Laboratorios", description = "Consulta de laboratorios farmacéuticos")
public class LaboratorioController {

    private final LaboratorioService laboratorioService;

    public LaboratorioController(LaboratorioService laboratorioService) {
        this.laboratorioService = laboratorioService;
    }

    @GetMapping
    @Operation(summary = "Listar todos los laboratorios activos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<List<LaboratorioDto>> listar() {
        return ResponseEntity.ok(laboratorioService.listarActivos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener laboratorio por ID")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<LaboratorioDto> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(laboratorioService.obtenerPorId(id));
    }
}
