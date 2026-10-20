package pe.farmagest.compras.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.compras.dto.CrearProveedorRequest;
import pe.farmagest.compras.dto.ProveedorDto;
import pe.farmagest.compras.entity.Proveedor;
import pe.farmagest.compras.repository.ProveedorRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public ProveedorService(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    public List<ProveedorDto> listarActivos() {
        return proveedorRepository.findByActivoTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProveedorDto obtenerPorId(Integer id) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));
        return mapToDto(p);
    }

    @Transactional
    public ProveedorDto crear(CrearProveedorRequest req) {
        if (proveedorRepository.existsByRuc(req.getRuc())) {
            throw new IllegalArgumentException("Ya existe un proveedor registrado con el RUC: " + req.getRuc());
        }

        Proveedor p = new Proveedor(
                req.getRuc(),
                req.getRazonSocial(),
                req.getNombreContacto(),
                req.getTelefono(),
                req.getEmail(),
                req.getDireccion()
        );
        p = proveedorRepository.save(p);
        return mapToDto(p);
    }

    @Transactional
    public ProveedorDto actualizar(Integer id, CrearProveedorRequest req) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));

        if (!p.getRuc().equals(req.getRuc()) && proveedorRepository.existsByRuc(req.getRuc())) {
            throw new IllegalArgumentException("El nuevo RUC ya pertenece a otro proveedor registrado");
        }

        p.setRuc(req.getRuc());
        p.setRazonSocial(req.getRazonSocial());
        p.setNombreContacto(req.getNombreContacto());
        p.setTelefono(req.getTelefono());
        p.setEmail(req.getEmail());
        p.setDireccion(req.getDireccion());

        p = proveedorRepository.save(p);
        return mapToDto(p);
    }

    @Transactional
    public void darDeBaja(Integer id) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));
        p.setActivo(false);
        proveedorRepository.save(p);
    }

    public ProveedorDto mapToDto(Proveedor p) {
        return new ProveedorDto(
                p.getId(),
                p.getRuc(),
                p.getRazonSocial(),
                p.getNombreContacto(),
                p.getTelefono(),
                p.getEmail(),
                p.getDireccion(),
                p.getActivo(),
                p.getCreadoEn()
        );
    }
}
