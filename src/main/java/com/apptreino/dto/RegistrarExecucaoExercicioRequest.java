package com.apptreino.dto;

import java.util.List;

public class RegistrarExecucaoExercicioRequest {

    private Long duracaoSegundos;
    private String observacoesAluno;
    private List<ExecucaoSerieRequest> series;

    public RegistrarExecucaoExercicioRequest() {
    }

    public Long getDuracaoSegundos() {
        return duracaoSegundos;
    }

    public void setDuracaoSegundos(Long duracaoSegundos) {
        this.duracaoSegundos = duracaoSegundos;
    }

    public String getObservacoesAluno() {
        return observacoesAluno;
    }

    public void setObservacoesAluno(String observacoesAluno) {
        this.observacoesAluno = observacoesAluno;
    }

    public List<ExecucaoSerieRequest> getSeries() {
        return series;
    }

    public void setSeries(List<ExecucaoSerieRequest> series) {
        this.series = series;
    }
}
