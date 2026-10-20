package pe.farmagest.catalogo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductoDto {

    private Long id;
    private String codigoBarras;
    private String nombre;
    private String principioActivo;
    private String concentracion;
    private String presentacion;
    private CategoriaDto categoria;
    private LaboratorioDto laboratorio;
    private BigDecimal precioVenta;
    private BigDecimal precioCosto; // Oculto / null para roles sin privilegio (ej. Vendedor)
    private BigDecimal margenPorcentaje; // Calculado sólo para Administrador
    private Boolean requiereReceta;
    private Boolean activo;
    private LocalDateTime creadoEn;

    public ProductoDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getPrincipioActivo() {
        return principioActivo;
    }

    public void setPrincipioActivo(String principioActivo) {
        this.principioActivo = principioActivo;
    }

    public String getConcentracion() {
        return concentracion;
    }

    public void setConcentracion(String concentracion) {
        this.concentracion = concentracion;
    }

    public String getPresentacion() {
        return presentacion;
    }

    public void setPresentacion(String presentacion) {
        this.presentacion = presentacion;
    }

    public CategoriaDto getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaDto categoria) {
        this.categoria = categoria;
    }

    public LaboratorioDto getLaboratorio() {
        return laboratorio;
    }

    public void setLaboratorio(LaboratorioDto laboratorio) {
        this.laboratorio = laboratorio;
    }

    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public BigDecimal getPrecioCosto() {
        return precioCosto;
    }

    public void setPrecioCosto(BigDecimal precioCosto) {
        this.precioCosto = precioCosto;
    }

    public BigDecimal getMargenPorcentaje() {
        return margenPorcentaje;
    }

    public void setMargenPorcentaje(BigDecimal margenPorcentaje) {
        this.margenPorcentaje = margenPorcentaje;
    }

    public Boolean getRequiereReceta() {
        return requiereReceta;
    }

    public void setRequiereReceta(Boolean requiereReceta) {
        this.requiereReceta = requiereReceta;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
}
