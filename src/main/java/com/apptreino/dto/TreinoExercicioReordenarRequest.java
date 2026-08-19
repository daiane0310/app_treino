package com.apptreino.dto;

import java.util.List;

public class TreinoExercicioReordenarRequest {

    private List<TreinoExercicioOrdemItemRequest> itens;

    public TreinoExercicioReordenarRequest() {
    }

    public List<TreinoExercicioOrdemItemRequest> getItens() {
        return itens;
    }

    public void setItens(List<TreinoExercicioOrdemItemRequest> itens) {
        this.itens = itens;
    }
}
