package pe.farmagest.reportes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.reportes.entity.MetricaPagoDiaria;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricaPagoDiariaRepository extends JpaRepository<MetricaPagoDiaria, Long> {
    Optional<MetricaPagoDiaria> findBySucursalIdAndFechaAndMedioPago(Integer sucursalId, LocalDate fecha, String medioPago);

    @Query("SELECT m.medioPago, SUM(m.montoTotal), SUM(m.totalTransacciones) " +
           "FROM MetricaPagoDiaria m " +
           "WHERE m.sucursalId = :sucursalId AND m.fecha BETWEEN :desde AND :hasta " +
           "GROUP BY m.medioPago " +
           "ORDER BY SUM(m.montoTotal) DESC")
    List<Object[]> findResumenPorMedioPago(
            @Param("sucursalId") Integer sucursalId,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
