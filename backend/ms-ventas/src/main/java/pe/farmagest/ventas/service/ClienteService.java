package pe.farmagest.ventas.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.farmagest.ventas.dto.ClienteDto;
import pe.farmagest.ventas.dto.CrearClienteRequest;
import pe.farmagest.ventas.entity.Cliente;
import pe.farmagest.ventas.repository.ClienteRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<ClienteDto> listarClientes(String query) {
        List<Cliente> clientes;
        if (query != null && !query.isBlank()) {
            clientes = clienteRepository.buscarClientes(query.trim());
        } else {
            clientes = clienteRepository.findByActivoTrueOrderByNombresORazonSocialAsc();
        }
        return clientes.stream().map(this::mapearADto).collect(Collectors.toList());
    }

    public Optional<ClienteDto> buscarPorDocumento(String numeroDocumento) {
        return clienteRepository.findByNumeroDocumentoAndActivoTrue(numeroDocumento)
                .map(this::mapearADto);
    }

    public ClienteDto obtenerPorId(Long id) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + id));
        return mapearADto(c);
    }

    @Transactional
    public ClienteDto crearCliente(CrearClienteRequest request) {
        clienteRepository.findByNumeroDocumentoAndActivoTrue(request.getNumeroDocumento())
                .ifPresent(c -> {
                    throw new IllegalStateException("Ya existe un cliente registrado con el documento: " + request.getNumeroDocumento());
                });

        Cliente cliente = new Cliente(
                request.getTipoDocumento(),
                request.getNumeroDocumento().trim(),
                request.getNombresORazonSocial().trim(),
                request.getDireccion(),
                request.getTelefono(),
                request.getEmail()
        );

        Cliente guardado = clienteRepository.save(cliente);
        return mapearADto(guardado);
    }

    public ClienteDto mapearADto(Cliente c) {
        return new ClienteDto(
                c.getId(),
                c.getTipoDocumento(),
                c.getNumeroDocumento(),
                c.getNombresORazonSocial(),
                c.getDireccion(),
                c.getTelefono(),
                c.getEmail(),
                c.getActivo()
        );
    }
}
