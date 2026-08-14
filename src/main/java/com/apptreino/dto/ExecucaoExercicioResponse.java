package com.apptreino.dto;

import com.apptreino.model.ExecucaoExercicio;

import java.math.BigDecimal;
import java.util.List;

public class ExecucaoExercicioResponse {

    private final Long id;
    private final Long exercicioIdSnapshot;
    private final String exercicioNomeSnapshot;
    private final Integer ordemPlanejada;
    private final Integer seriesPlanejadas;
    private final String repeticoesPlanejadas;
    private final BigDecimal cargaPlanejada;
    private final String observacoesPrescricao;
    private final Long duracaoSegundos;
    private final String observacoesAluno;
    private final List<ExecucaoSerieResponse> series;

    public ExecucaoExercicioResponse(
            ExecucaoExercicio execucaoExercicio,
            List<ExecucaoSerieResponse> series
    ) {
        this.id = execucaoExercicio.getId();
        this.exercicioIdSnapshot = execucaoExercicio.getExercicioIdSnapshot();
        this.exercicioNomeSnapshot = execucaoExercicio.getExercicioNomeSnapshot();
        this.ordemPlanejada = execucaoExercicio.getOrdemPlanejada();
        this.seriesPlanejadas = execucaoExercicio.getSeriesPlanejadas();
        this.repeticoesPlanejadas = execucaoExercicio.getRepeticoesPlanejadas();
        this.cargaPlanejada = execucaoExercicio.getCargaPlanejada();
        this.observacoesPrescricao = execucaoExercicio.getObservacoesPrescricao();
        this.duracaoSegundos = execucaoExercicio.getDuracaoSegundos();
        this.observacoesAluno = execucaoExercicio.getObservacoesAluno();
        this.series = series;
    }

    public Long getId() { return id; }
    public Long getExercicioIdSnapshot() { return exercicioIdSnapshot; }
    public String getExercicioNomeSnapshot() { return exercicioNomeSnapshot; }
    public Integer getOrdemPlanejada() { return ordemPlanejada; }
    public Integer getSeriesPlanejadas() { return seriesPlanejadas; }
    public String getRepeticoesPlanejadas() { return repeticoesPlanejadas; }
    public BigDecimal getCargaPlanejada() { return cargaPlanejada; }
    public String getObservacoesPrescricao() { return observacoesPrescricao; }
    public Long getDuracaoSegundos() { return duracaoSegundos; }
    public String getObservacoesAluno() { return observacoesAluno; }
    public List<ExecucaoSerieResponse> getSeries() { return series; }
}
