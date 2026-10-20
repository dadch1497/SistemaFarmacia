package pe.farmagest.reportes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.reportes.entity.ResumenVentaDiaria;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResumenVentaDiariaRepository extends JpaRepository<ResumenVentaDiaria, Long> {
    Optional<ResumenVentaDiaria> findBySucursalIdAndFecha(Integer sucursalId, LocalDate fecha);
    List<ResumenVentaDiaria> findBySucursalIdAndFechaBetweenOrderByFechaAsc(Integer sucursalId, LocalDate desde, LocalDate hasta);
}
