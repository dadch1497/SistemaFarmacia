package pe.farmagest.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.ventas.entity.VentaEspera;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaEsperaRepository extends JpaRepository<VentaEspera, Long> {
    List<VentaEspera> findByUsuarioIdOrderByFechaHoraDesc(Long usuarioId);
    Optional<VentaEspera> findByCodigoEspera(String codigoEspera);
}
