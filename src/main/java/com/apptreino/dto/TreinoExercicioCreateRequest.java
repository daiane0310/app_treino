package com.apptreino.dto;

import java.math.BigDecimal;

public class TreinoExercicioCreateRequest {

    private Long exercicioId;
    private Integer ordem;
    private Integer seriesPlanejadas;
    private String repeticoesPlanejadas;
    private BigDecimal cargaPlanejada;
    private String observacoes;

    public TreinoExercicioCreateRequest() {
    }

    public Long getExercicioId() {
        return exercicioId;
    }

    public void setExercicioId(Long exercicioId) {
        this.exercicioId = exercicioId;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public Integer getSeriesPlanejadas() {
        return seriesPlanejadas;
    }

    public void setSeriesPlanejadas(Integer seriesPlanejadas) {
        this.seriesPlanejadas = seriesPlanejadas;
    }

    public String getRepeticoesPlanejadas() {
        return repeticoesPlanejadas;
    }

    public void setRepeticoesPlanejadas(String repeticoesPlanejadas) {
        this.repeticoesPlanejadas = repeticoesPlanejadas;
    }

    public BigDecimal getCargaPlanejada() {
        return cargaPlanejada;
    }

    public void setCargaPlanejada(BigDecimal cargaPlanejada) {
        this.cargaPlanejada = cargaPlanejada;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
