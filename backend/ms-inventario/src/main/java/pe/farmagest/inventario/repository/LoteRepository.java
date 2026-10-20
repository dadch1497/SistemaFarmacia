package pe.farmagest.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.inventario.entity.EstadoLote;
import pe.farmagest.inventario.entity.Lote;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByProductoIdAndSucursalIdOrderByFechaVencimientoAsc(Long productoId, Integer sucursalId);

    // FEFO: lotes disponibles ordenados por vencimiento ascendente (el que vence antes sale primero)
    @Query("SELECT l FROM Lote l WHERE l.productoId = :productoId AND l.sucursalId = :sucursalId " +
           "AND l.estado = :estado AND l.cantidadActual > 0 " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findLotesParaDespachoFefo(
            @Param("productoId") Long productoId,
            @Param("sucursalId") Integer sucursalId,
            @Param("estado") EstadoLote estado
    );

    // Lotes por vencer dentro del horizonte especificado
    @Query("SELECT l FROM Lote l WHERE l.sucursalId = :sucursalId " +
           "AND l.estado = 'DISPONIBLE' AND l.cantidadActual > 0 " +
           "AND l.fechaVencimiento <= :fechaLimite " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findLotesPorVencer(
            @Param("sucursalId") Integer sucursalId,
            @Param("fechaLimite") LocalDate fechaLimite
    );

    Optional<Lote> findByProductoIdAndNumeroLoteAndSucursalId(Long productoId, String numeroLote, Integer sucursalId);
}
