package pe.farmagest.inventario.repository;
import pe.farmagest.inventario.entity.ConteoFisico;import org.springframework.data.jpa.repository.*;import jakarta.persistence.LockModeType;import java.util.*;import org.springframework.data.domain.Pageable;
public interface ConteoRepository extends JpaRepository<ConteoFisico,Long> {
 List<ConteoFisico> findBySucursalIdOrderByIdDesc(Integer sucursalId,Pageable page);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select c from ConteoFisico c where c.id=?1") Optional<ConteoFisico> bloquear(Long id);
}
