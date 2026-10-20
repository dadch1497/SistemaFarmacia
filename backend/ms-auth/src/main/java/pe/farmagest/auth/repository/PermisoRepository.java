package pe.farmagest.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.auth.entity.Permiso;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Integer> {

    Optional<Permiso> findByCodigo(String codigo);

    List<Permiso> findByModulo(String modulo);
}
