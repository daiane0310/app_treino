package com.apptreino.dto;

import com.apptreino.model.SeriePrescritaSnapshot;
import java.math.BigDecimal;

public record SeriePrescritaSnapshotResponse(Long id, Integer numeroSerie, Integer repeticoesPlanejadas, BigDecimal cargaPlanejada) {
    public SeriePrescritaSnapshotResponse(SeriePrescritaSnapshot serie) {
        this(serie.getId(), serie.getNumeroSerie(), serie.getRepeticoesPlanejadas(), serie.getCargaPlanejada());
    }
}
