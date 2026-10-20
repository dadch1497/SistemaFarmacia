package pe.farmagest.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.ventas.entity.Devolucion;

import java.util.List;

@Repository
public interface DevolucionRepository extends JpaRepository<Devolucion, Long> {
    List<Devolucion> findByVentaId(Long ventaId);
    List<Devolucion> findBySucursalIdOrderByFechaHoraDesc(Integer sucursalId);
}
