package pe.farmagest.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.ventas.entity.Cliente;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByNumeroDocumentoAndActivoTrue(String numeroDocumento);

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND " +
           "(LOWER(c.nombresORazonSocial) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "c.numeroDocumento LIKE CONCAT('%', :query, '%'))")
    List<Cliente> buscarClientes(@Param("query") String query);

    List<Cliente> findByActivoTrueOrderByNombresORazonSocialAsc();
}
