package pe.farmagest.ventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.farmagest.ventas.entity.TipoComprobante;
import pe.farmagest.ventas.entity.Venta;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findBySucursalIdOrderByFechaHoraDesc(Integer sucursalId);

    List<Venta> findByUsuarioVendedorIdAndSucursalIdOrderByFechaHoraDesc(Long usuarioVendedorId, Integer sucursalId);

    List<Venta> findBySesionCajaIdOrderByFechaHoraDesc(Long sesionCajaId);

    @Query("SELECT COUNT(v) FROM Venta v WHERE v.tipoComprobante = :tipo AND v.serieComprobante = :serie")
    long countByTipoComprobanteAndSerieComprobante(
            @Param("tipo") TipoComprobante tipo,
            @Param("serie") String serie
    );

    Optional<Venta> findBySerieComprobanteAndNumeroComprobante(String serie, String numero);
}
