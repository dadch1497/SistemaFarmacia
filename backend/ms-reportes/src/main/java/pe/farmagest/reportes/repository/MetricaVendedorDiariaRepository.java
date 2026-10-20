package pe.farmagest.reportes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.reportes.entity.MetricaVendedorDiaria;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricaVendedorDiariaRepository extends JpaRepository<MetricaVendedorDiaria, Long> {
    Optional<MetricaVendedorDiaria> findBySucursalIdAndFechaAndUsuarioId(Integer sucursalId, LocalDate fecha, Long usuarioId);

    @Query("SELECT m.usuarioId, m.nombreVendedor, SUM(m.montoTotal), SUM(m.totalVentas) " +
           "FROM MetricaVendedorDiaria m " +
           "WHERE m.sucursalId = :sucursalId AND m.fecha BETWEEN :desde AND :hasta " +
           "GROUP BY m.usuarioId, m.nombreVendedor " +
           "ORDER BY SUM(m.montoTotal) DESC")
    List<Object[]> findResumenPorVendedor(
            @Param("sucursalId") Integer sucursalId,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
