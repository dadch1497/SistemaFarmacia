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

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_READ)
    @Query("select ps from ProductoStock ps where ps.sucursalId = ?1 order by ps.productoId")
    List<ProductoStock> bloquearSucursal(Integer sucursalId);

    @Query("SELECT ps FROM ProductoStock ps WHERE ps.sucursalId = :sucursalId AND ps.stockActual <= ps.stockMinimo")
    List<ProductoStock> findStockBajo(@Param("sucursalId") Integer sucursalId);
}
