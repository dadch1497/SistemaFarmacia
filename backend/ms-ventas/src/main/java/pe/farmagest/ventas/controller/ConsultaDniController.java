package pe.farmagest.ventas.controller;

import org.springframework.http.ProblemDetail;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.farmagest.ventas.dto.ClienteDto;
import pe.farmagest.ventas.service.ConsultaDniService;

@RestController
@RequestMapping("/api/ventas/clientes/consulta-dni")
public class ConsultaDniController {
    private final ConsultaDniService service;
    public ConsultaDniController(ConsultaDniService service) { this.service = service; }
    public record Solicitud(String dni) {}
    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR')")
    public ClienteDto consultar(@RequestBody Solicitud solicitud) { return service.consultarYGuardar(solicitud.dni()); }
    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail error(ResponseStatusException error) {
        return ProblemDetail.forStatusAndDetail(error.getStatusCode(), error.getReason());
    }
}
