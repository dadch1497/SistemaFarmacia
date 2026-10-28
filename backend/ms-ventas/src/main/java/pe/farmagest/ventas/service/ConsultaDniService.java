package pe.farmagest.ventas.service;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pe.farmagest.ventas.dto.ClienteDto;
import pe.farmagest.ventas.entity.Cliente;
import pe.farmagest.ventas.entity.TipoDocumento;
import pe.farmagest.ventas.repository.ClienteRepository;

@Service
public class ConsultaDniService {
    private final ClienteRepository repository;
    private final ClienteService clientes;
    private final CodartDniClient codart;
    public ConsultaDniService(ClienteRepository repository, ClienteService clientes, CodartDniClient codart) {
        this.repository = repository; this.clientes = clientes; this.codart = codart;
    }

    // Evita peticiones simultáneas repetidas dentro de esta instancia. La BD garantiza unicidad.
    public synchronized ClienteDto consultarYGuardar(String dni) {
        return consultarDocumento(dni, false);
    }
    public synchronized ClienteDto consultarRucYGuardar(String ruc) {
        return consultarDocumento(ruc, true);
    }
    private ClienteDto consultarDocumento(String dni, boolean ruc) {
        if (dni == null || !dni.matches(ruc ? "[0-9]{11}" : "[0-9]{8}") || dni.matches("0+"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ruc ? "Ingresa un RUC de 11 dígitos válido." : "Ingresa un DNI de 8 dígitos distinto al cliente genérico.");
        var local = repository.findByNumeroDocumento(dni);
        if (local.isPresent()) return clienteActivo(local.get());
        String nombre = ruc ? codart.consultarRazonSocial(dni) : codart.consultarNombre(dni);
        // No se guardan campos restringidos, direcciones ni datos adicionales de identidad.
        try {
            return clientes.mapearADto(repository.saveAndFlush(new Cliente(ruc ? TipoDocumento.RUC : TipoDocumento.DNI, dni, nombre, null, null, null)));
        } catch (DataIntegrityViolationException duplicate) {
            var existente = repository.findByNumeroDocumento(dni);
            if (existente.isPresent()) return clienteActivo(existente.get());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se pudo guardar el cliente. Revisa el registro antes de volver a consultar.");
        }
    }

    private ClienteDto clienteActivo(Cliente cliente) {
        if (!Boolean.TRUE.equals(cliente.getActivo()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El cliente está inactivo. Revisa su registro sin volver a consultar CodArt.");
        return clientes.mapearADto(cliente);
    }
}
