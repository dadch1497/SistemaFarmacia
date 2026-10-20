package pe.farmagest.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.farmagest.ventas.entity.Promocion;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {

    @Query("SELECT p FROM Promocion p WHERE p.activo = true AND :hoy BETWEEN p.fechaInicio AND p.fechaFin")
    List<Promocion> findPromocionesVigentes(LocalDate hoy);

    List<Promocion> findByActivoTrue();
}
