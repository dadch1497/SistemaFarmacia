package pe.farmagest.catalogo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.farmagest.catalogo.entity.HistorialPrecio;

import java.util.List;

@Repository
public interface HistorialPrecioRepository extends JpaRepository<HistorialPrecio, Long> {

    List<HistorialPrecio> findByProductoIdOrderByFechaCambioDesc(Long productoId);
}
