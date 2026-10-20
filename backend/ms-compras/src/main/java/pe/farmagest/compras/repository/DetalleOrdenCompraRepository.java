package pe.farmagest.compras.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.compras.entity.DetalleOrdenCompra;

import java.util.List;

@Repository
public interface DetalleOrdenCompraRepository extends JpaRepository<DetalleOrdenCompra, Long> {
    List<DetalleOrdenCompra> findByOrdenCompraId(Long ordenCompraId);
}
