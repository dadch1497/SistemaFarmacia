package pe.farmagest.reportes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.reportes.entity.MetricaProductoDiaria;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricaProductoDiariaRepository extends JpaRepository<MetricaProductoDiaria, Long> {
    Optional<MetricaProductoDiaria> findBySucursalIdAndFechaAndProductoId(Integer sucursalId, LocalDate fecha, Long productoId);

    @Query("SELECT m.productoId, m.nombreProducto, SUM(m.unidadesVendidas), SUM(m.montoVendido) " +
           "FROM MetricaProductoDiaria m " +
           "WHERE m.sucursalId = :sucursalId AND m.fecha BETWEEN :desde AND :hasta " +
           "GROUP BY m.productoId, m.nombreProducto " +
           "ORDER BY SUM(m.unidadesVendidas) DESC")
    List<Object[]> findTopProductosVendidos(
            @Param("sucursalId") Integer sucursalId,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
