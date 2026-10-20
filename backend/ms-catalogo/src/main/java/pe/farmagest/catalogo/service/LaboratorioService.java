package pe.farmagest.catalogo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.catalogo.dto.LaboratorioDto;
import pe.farmagest.catalogo.entity.Laboratorio;
import pe.farmagest.catalogo.repository.LaboratorioRepository;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class LaboratorioService {

    private final LaboratorioRepository laboratorioRepository;

    public LaboratorioService(LaboratorioRepository laboratorioRepository) {
        this.laboratorioRepository = laboratorioRepository;
    }

    @Transactional(readOnly = true)
    public List<LaboratorioDto> listarTodos() {
        return laboratorioRepository.findAll().stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LaboratorioDto> listarActivos() {
        return laboratorioRepository.findByActivoTrue().stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LaboratorioDto obtenerPorId(Integer id) {
        Laboratorio lab = laboratorioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Laboratorio no encontrado con ID: " + id));
        return mapearADto(lab);
    }

    public LaboratorioDto mapearADto(Laboratorio l) {
        return new LaboratorioDto(l.getId(), l.getNombre(), l.getPaisOrigen(), l.getActivo());
    }
}
