package pe.farmagest.catalogo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.catalogo.entity.Producto;

import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoBarras(String codigoBarras);

    boolean existsByCodigoBarras(String codigoBarras);

    @Query("SELECT p FROM Producto p WHERE " +
           "(:activo IS NULL OR p.activo = :activo) AND " +
           "(:categoriaId IS NULL OR p.categoria.id = :categoriaId) AND " +
           "(:requiereReceta IS NULL OR p.requiereReceta = :requiereReceta) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.principioActivo) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Producto> buscarProductos(
            @Param("query") String query,
            @Param("categoriaId") Integer categoriaId,
            @Param("requiereReceta") Boolean requiereReceta,
            @Param("activo") Boolean activo,
            Pageable pageable
    );
}
