package pe.farmagest.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.ventas.entity.Caja;

import java.util.List;
import java.util.Optional;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Integer> {
    List<Caja> findBySucursalIdAndActivoTrue(Integer sucursalId);
    Optional<Caja> findByCodigo(String codigo);
}
