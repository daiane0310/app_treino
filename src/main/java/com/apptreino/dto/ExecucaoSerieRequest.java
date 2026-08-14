package com.apptreino.dto;

import java.math.BigDecimal;

public class ExecucaoSerieRequest {

    private Integer numeroSerie;
    private Integer repeticoes;
    private BigDecimal cargaUtilizada;
    private Long duracaoSegundos;
    private boolean concluida;

    public ExecucaoSerieRequest() {
    }

    public Integer getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(Integer numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public Integer getRepeticoes() {
        return repeticoes;
    }

    public void setRepeticoes(Integer repeticoes) {
        this.repeticoes = repeticoes;
    }

    public BigDecimal getCargaUtilizada() {
        return cargaUtilizada;
    }

    public void setCargaUtilizada(BigDecimal cargaUtilizada) {
        this.cargaUtilizada = cargaUtilizada;
    }

    public Long getDuracaoSegundos() {
        return duracaoSegundos;
    }

    public void setDuracaoSegundos(Long duracaoSegundos) {
        this.duracaoSegundos = duracaoSegundos;
    }

    public boolean isConcluida() {
        return concluida;
    }

    public void setConcluida(boolean concluida) {
        this.concluida = concluida;
    }
}
