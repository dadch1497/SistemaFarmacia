package pe.farmagest.compras.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.compras.entity.EstadoOrden;
import pe.farmagest.compras.entity.OrdenCompra;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {

    List<OrdenCompra> findBySucursalIdOrderByFechaEmisionDesc(Integer sucursalId);

    List<OrdenCompra> findByEstadoAndSucursalId(EstadoOrden estado, Integer sucursalId);

    Optional<OrdenCompra> findByNumeroOrden(String numeroOrden);
}
