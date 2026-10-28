package pe.farmagest.ventas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.farmagest.ventas.dto.ClienteDto;
import pe.farmagest.ventas.dto.CrearClienteRequest;
import pe.farmagest.ventas.service.ClienteService;

import java.util.List;

@RestController
@RequestMapping("/api/ventas/clientes")
@Tag(name = "Clientes", description = "Registro y consulta de clientes en el POS")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Listar o buscar clientes por nombre o DNI/RUC")
    public ResponseEntity<List<ClienteDto>> listarClientes(
            @RequestParam(name = "q", required = false) String query
    ) {
        return ResponseEntity.ok(clienteService.listarClientes(query));
    }

    @GetMapping("/documento/{numero}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Buscar cliente por DNI o RUC")
    public ResponseEntity<ClienteDto> buscarPorDocumento(@PathVariable String numero) {
        return clienteService.buscarPorDocumento(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Obtener cliente por ID")
    public ResponseEntity<ClienteDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    public record ContactoRequest(
        @jakarta.validation.constraints.Size(max=200) String direccion,
        @jakarta.validation.constraints.Size(max=30) String telefono,
        @jakarta.validation.constraints.Size(max=100) @jakarta.validation.constraints.Email String email) {}

    @PatchMapping("/{id}/contacto")
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    public ClienteDto actualizarContacto(@PathVariable Long id, @Valid @RequestBody ContactoRequest request) {
        return clienteService.actualizarContacto(id, request.direccion(), request.telefono(), request.email());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    @Operation(summary = "Registrar nuevo cliente")
    public ResponseEntity<ClienteDto> crearCliente(@Valid @RequestBody CrearClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crearCliente(request));
    }
}
