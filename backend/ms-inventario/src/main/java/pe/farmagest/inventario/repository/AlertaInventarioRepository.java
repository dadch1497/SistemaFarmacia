package pe.farmagest.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.inventario.entity.AlertaInventario;

import java.util.List;

@Repository
public interface AlertaInventarioRepository extends JpaRepository<AlertaInventario, Long> {

    List<AlertaInventario> findBySucursalIdAndAtendidaFalseOrderByNivelUrgenciaDescFechaAlertaDesc(Integer sucursalId);

    List<AlertaInventario> findByProductoIdAndAtendidaFalse(Long productoId);
}
