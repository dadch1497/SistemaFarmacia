package pe.farmagest.compras.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.compras.entity.IngresoMercaderia;

import java.util.List;

@Repository
public interface IngresoMercaderiaRepository extends JpaRepository<IngresoMercaderia, Long> {
    List<IngresoMercaderia> findBySucursalIdOrderByFechaRecepcionDesc(Integer sucursalId);
}
