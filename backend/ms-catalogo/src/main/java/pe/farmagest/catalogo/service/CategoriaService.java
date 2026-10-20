package pe.farmagest.catalogo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.catalogo.dto.CategoriaDto;
import pe.farmagest.catalogo.entity.Categoria;
import pe.farmagest.catalogo.repository.CategoriaRepository;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaDto> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoriaDto> listarActivas() {
        return categoriaRepository.findByActivoTrue().stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoriaDto obtenerPorId(Integer id) {
        Categoria cat = categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada con ID: " + id));
        return mapearADto(cat);
    }

    public CategoriaDto mapearADto(Categoria c) {
        return new CategoriaDto(c.getId(), c.getNombre(), c.getDescripcion(), c.getActivo());
    }
}
