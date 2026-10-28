package pe.farmagest.inventario.dto;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import pe.farmagest.inventario.entity.TipoMovimiento;
public record ReporteInventarioResponse(Integer sucursalId,LocalDate desde,LocalDate hasta,String zonaHoraria,
 Instant corteActualEn,Resumen resumen,List<Movimiento> movimientos,List<Valoracion> valoracion) {
 public record Resumen(long entradas,long salidas,long ajustes,long unidadesMerma,BigDecimal costoMermasRegistrado,
  long unidadesMermaSinCosto,BigDecimal valorActualConocido,long unidadesActualesSinCosto,long productosConDiferencia) {}
 public record Movimiento(Long id,Long productoId,String numeroLote,TipoMovimiento tipoMovimiento,Integer cantidad,
  Integer saldoResultante,String referenciaTipo,String referenciaId,String motivo,Long usuarioId,Instant fechaHora,
  BigDecimal costoUnitarioRegistrado,BigDecimal costoMovimiento) {}
 public record Valoracion(Long productoId,long stockConsolidado,long stockEnLotes,long diferencia,BigDecimal valorConocido,
  long unidadesSinCosto,long lotesConSaldo,long unidadesNoDisponibles) {}
}
