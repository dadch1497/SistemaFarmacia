package pe.farmagest.reportes.dto;

import java.math.BigDecimal;

public class VentaDiaSemanaDto {
    private String dia;
    private BigDecimal montoPromedio;
    private Boolean esMayor;

    public VentaDiaSemanaDto() {}

    public VentaDiaSemanaDto(String dia, BigDecimal montoPromedio, Boolean esMayor) {
        this.dia = dia;
        this.montoPromedio = montoPromedio;
        this.esMayor = esMayor;
    }

    public String getDia() { return dia; }
    public void setDia(String dia) { this.dia = dia; }

    public BigDecimal getMontoPromedio() { return montoPromedio; }
    public void setMontoPromedio(BigDecimal montoPromedio) { this.montoPromedio = montoPromedio; }

    public Boolean getEsMayor() { return esMayor; }
    public void setEsMayor(Boolean esMayor) { this.esMayor = esMayor; }
}
