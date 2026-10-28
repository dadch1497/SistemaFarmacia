package pe.farmagest.inventario.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.inventario.entity.MovimientoKardex;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface MovimientoKardexRepository extends JpaRepository<MovimientoKardex, Long> {

    @Query("select coalesce(max(k.id),0) from MovimientoKardex k where k.sucursalId=?1")
    Long ultimoIdSucursal(Integer sucursalId);
    @Query("select coalesce(max(k.id),0) from MovimientoKardex k where k.sucursalId=?1 and k.productoId=?2")
    Long ultimoIdProducto(Integer sucursalId,Long productoId);

    List<MovimientoKardex> findByProductoIdAndSucursalIdOrderByFechaHoraDesc(Long productoId, Integer sucursalId);

    Page<MovimientoKardex> findBySucursalIdOrderByFechaHoraDesc(Integer sucursalId, Pageable pageable);
    @Query("SELECT k FROM MovimientoKardex k LEFT JOIN FETCH k.lote WHERE k.sucursalId=:sucursal " +
      "AND (:producto IS NULL OR k.productoId=:producto) AND k.fechaHora>=:desde AND k.fechaHora<:hasta " +
      "ORDER BY k.fechaHora DESC, k.id DESC")
    List<MovimientoKardex> reporte(@Param("sucursal") Integer sucursal, @Param("producto") Long producto,
      @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta, Pageable limite);

}
