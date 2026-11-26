package com.apptreino.dto;

import com.apptreino.model.TreinoExercicio;

import java.math.BigDecimal;

public class TreinoExercicioResponse {
    private final com.apptreino.model.FormatoPrescricao formatoPrescricao;
    private final java.util.List<SeriePrescritaResponse> seriesPrescritas;
    public com.apptreino.model.FormatoPrescricao getFormatoPrescricao() { return formatoPrescricao; }
    public java.util.List<SeriePrescritaResponse> getSeriesPrescritas() { return seriesPrescritas; }

    private final Long id;
    private final Long treinoId;
    private final Long exercicioId;
    private final String exercicioNome;
    private final Integer ordem;
    private final Integer seriesPlanejadas;
    private final String repeticoesPlanejadas;
    private final BigDecimal cargaPlanejada;
    private final String observacoes;

    public TreinoExercicioResponse(TreinoExercicio treinoExercicio) {
        this.formatoPrescricao = treinoExercicio.getFormatoPrescricao();
        this.seriesPrescritas = treinoExercicio.getSeriesPrescritas().stream().map(SeriePrescritaResponse::new).toList();
        this.id = treinoExercicio.getId();
        this.treinoId = treinoExercicio.getTreino().getId();
        this.exercicioId = treinoExercicio.getExercicio().getId();
        this.exercicioNome = treinoExercicio.getExercicio().getNome();
        this.ordem = treinoExercicio.getOrdem();
        this.seriesPlanejadas = treinoExercicio.getSeriesPlanejadas();
        this.repeticoesPlanejadas = treinoExercicio.getRepeticoesPlanejadas();
        this.cargaPlanejada = treinoExercicio.getCargaPlanejada();
        this.observacoes = treinoExercicio.getObservacoes();
    }

    public Long getId() {
        return id;
    }

    public Long getTreinoId() {
        return treinoId;
    }

    public Long getExercicioId() {
        return exercicioId;
    }

    public String getExercicioNome() {
        return exercicioNome;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public Integer getSeriesPlanejadas() {
        return seriesPlanejadas;
    }

    public String getRepeticoesPlanejadas() {
        return repeticoesPlanejadas;
    }

    public BigDecimal getCargaPlanejada() {
        return cargaPlanejada;
    }

    public String getObservacoes() {
        return observacoes;
    }
}
