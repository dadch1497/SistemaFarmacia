package pe.farmagest.catalogo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.catalogo.entity.Categoria;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    Optional<Categoria> findByNombre(String nombre);

    List<Categoria> findByActivoTrue();

    boolean existsByNombre(String nombre);
}
