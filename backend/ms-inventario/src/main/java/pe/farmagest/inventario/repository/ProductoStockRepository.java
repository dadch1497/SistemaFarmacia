package pe.farmagest.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.inventario.entity.ProductoStock;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoStockRepository extends JpaRepository<ProductoStock, Long> {

    Optional<ProductoStock> findByProductoIdAndSucursalId(Long productoId, Integer sucursalId);

    List<ProductoStock> findBySucursalId(Integer sucursalId);

    @Query("SELECT ps FROM ProductoStock ps WHERE ps.sucursalId = :sucursalId AND ps.stockActual <= ps.stockMinimo")
    List<ProductoStock> findStockBajo(@Param("sucursalId") Integer sucursalId);
}
