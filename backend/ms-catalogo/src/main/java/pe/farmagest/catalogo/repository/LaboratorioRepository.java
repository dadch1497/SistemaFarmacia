package pe.farmagest.catalogo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.catalogo.entity.Laboratorio;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaboratorioRepository extends JpaRepository<Laboratorio, Integer> {

    Optional<Laboratorio> findByNombre(String nombre);

    List<Laboratorio> findByActivoTrue();

    boolean existsByNombre(String nombre);
}
