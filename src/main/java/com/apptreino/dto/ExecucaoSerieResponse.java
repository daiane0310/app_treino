package com.apptreino.dto;

import com.apptreino.model.ExecucaoSerie;

import java.math.BigDecimal;

public class ExecucaoSerieResponse {

    private final Long id;
    private final Integer numeroSerie;
    private final Integer repeticoes;
    private final BigDecimal cargaUtilizada;
    private final Long duracaoSegundos;
    private final boolean concluida;

    public ExecucaoSerieResponse(ExecucaoSerie serie) {
        this.id = serie.getId();
        this.numeroSerie = serie.getNumeroSerie();
        this.repeticoes = serie.getRepeticoes();
        this.cargaUtilizada = serie.getCargaUtilizada();
        this.duracaoSegundos = serie.getDuracaoSegundos();
        this.concluida = serie.isConcluida();
    }

    public Long getId() {
        return id;
    }

    public Integer getNumeroSerie() {
        return numeroSerie;
    }

    public Integer getRepeticoes() {
        return repeticoes;
    }

    public BigDecimal getCargaUtilizada() {
        return cargaUtilizada;
    }

    public Long getDuracaoSegundos() {
        return duracaoSegundos;
    }

    public boolean isConcluida() {
        return concluida;
    }
}
