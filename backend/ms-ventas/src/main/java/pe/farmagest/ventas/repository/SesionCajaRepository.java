package pe.farmagest.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.ventas.entity.EstadoSesionCaja;
import pe.farmagest.ventas.entity.SesionCaja;

import java.util.List;
import java.util.Optional;

@Repository
public interface SesionCajaRepository extends JpaRepository<SesionCaja, Long> {

    Optional<SesionCaja> findFirstByUsuarioIdAndSucursalIdAndEstado(
            Long usuarioId, Integer sucursalId, EstadoSesionCaja estado
    );

    List<SesionCaja> findBySucursalIdOrderByFechaAperturaDesc(Integer sucursalId);

    List<SesionCaja> findByUsuarioIdAndSucursalIdOrderByFechaAperturaDesc(Long usuarioId, Integer sucursalId);

    @Query("SELECT s FROM SesionCaja s WHERE s.caja.id = :cajaId AND s.estado = 'ABIERTA'")
    Optional<SesionCaja> findCajaAbierta(@Param("cajaId") Integer cajaId);
}
