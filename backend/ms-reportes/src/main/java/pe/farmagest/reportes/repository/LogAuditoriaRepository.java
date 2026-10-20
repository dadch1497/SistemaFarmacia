package pe.farmagest.reportes.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.reportes.entity.LogAuditoria;

import java.util.List;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {
    Page<LogAuditoria> findBySucursalIdOrderByFechaHoraDesc(Integer sucursalId, Pageable pageable);
    List<LogAuditoria> findTop50BySucursalIdOrderByFechaHoraDesc(Integer sucursalId);
}
