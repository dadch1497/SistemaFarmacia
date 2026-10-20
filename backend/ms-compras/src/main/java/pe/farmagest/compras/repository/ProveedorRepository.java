package pe.farmagest.compras.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.compras.entity.Proveedor;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    List<Proveedor> findByActivoTrue();

    Optional<Proveedor> findByRuc(String ruc);

    boolean existsByRuc(String ruc);
}
