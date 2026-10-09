package com.apptreino.dto;

import com.apptreino.model.SeriePrescrita;
import java.math.BigDecimal;

public record SeriePrescritaResponse(Long id, Integer numeroSerie, Integer repeticoes, BigDecimal carga) {
    public SeriePrescritaResponse(SeriePrescrita serie) {
        this(serie.getId(), serie.getNumeroSerie(), serie.getRepeticoes(), serie.getCarga());
    }
}
