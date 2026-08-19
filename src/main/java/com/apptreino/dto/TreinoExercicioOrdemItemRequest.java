package com.apptreino.dto;

public class TreinoExercicioOrdemItemRequest {

    private Long treinoExercicioId;
    private Integer ordem;

    public TreinoExercicioOrdemItemRequest() {
    }

    public Long getTreinoExercicioId() {
        return treinoExercicioId;
    }

    public void setTreinoExercicioId(Long treinoExercicioId) {
        this.treinoExercicioId = treinoExercicioId;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }
}
