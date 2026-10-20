package pe.farmagest.compras.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.compras.entity.DetalleIngreso;

import java.util.List;

@Repository
public interface DetalleIngresoRepository extends JpaRepository<DetalleIngreso, Long> {
    List<DetalleIngreso> findByIngresoId(Long ingresoId);
}
