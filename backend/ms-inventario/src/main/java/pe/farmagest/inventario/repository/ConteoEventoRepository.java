package pe.farmagest.inventario.repository;
import pe.farmagest.inventario.entity.ConteoEvento;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface ConteoEventoRepository extends JpaRepository<ConteoEvento,Long> { List<ConteoEvento> findByConteoIdOrderByIdAsc(Long id); }
