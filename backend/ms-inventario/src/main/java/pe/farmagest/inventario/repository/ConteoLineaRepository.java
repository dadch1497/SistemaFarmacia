package pe.farmagest.inventario.repository;
import pe.farmagest.inventario.entity.ConteoLinea;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface ConteoLineaRepository extends JpaRepository<ConteoLinea,Long> {
 List<ConteoLinea> findByConteoIdOrderByIdAsc(Long id);
 Optional<ConteoLinea> findByConteoIdAndProductoId(Long id,Long productoId);
}
