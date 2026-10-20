package pe.farmagest.inventario.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.inventario.entity.MovimientoKardex;

import java.util.List;

@Repository
public interface MovimientoKardexRepository extends JpaRepository<MovimientoKardex, Long> {

    List<MovimientoKardex> findByProductoIdAndSucursalIdOrderByFechaHoraDesc(Long productoId, Integer sucursalId);

    Page<MovimientoKardex> findBySucursalIdOrderByFechaHoraDesc(Integer sucursalId, Pageable pageable);
}
