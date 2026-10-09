package com.apptreino.service;

import com.apptreino.dto.SeriePrescritaRequest;
import java.math.BigDecimal;
import java.util.List;

public final class SeriesPrescritasValidator {
    public static final int MAX_SERIES = 20;
    private SeriesPrescritasValidator() { }
    public static void validarQuantidadeMaxima(Integer quantidade) {
        if (quantidade != null && quantidade > MAX_SERIES) {
            throw new IllegalArgumentException("O limite é de 20 séries por exercício");
        }
    }
    public static void validar(List<SeriePrescritaRequest> series) {
        if (series == null || series.isEmpty()) {
            throw new IllegalArgumentException("Informe pelo menos uma série prescrita");
        }
        validarQuantidadeMaxima(series.size());
        for (int i = 0; i < series.size(); i++) {
            var serie = series.get(i);
            if (serie == null || serie.numeroSerie() == null || serie.numeroSerie() != i + 1) {
                throw new IllegalArgumentException("As séries devem estar numeradas em sequência de 1 até N");
            }
            if (serie.repeticoes() != null && serie.repeticoes() < 0) {
                throw new IllegalArgumentException("Repetições não podem ser negativas");
            }
            validarCarga(serie.carga());
        }
    }
    public static void validarCarga(BigDecimal carga) {
        if (carga != null && (carga.signum() < 0 || carga.compareTo(new BigDecimal("99999999.99")) > 0
                || carga.stripTrailingZeros().scale() > 2)) {
            throw new IllegalArgumentException("Carga deve estar entre 0 e 99999999,99 e ter até duas casas decimais");
        }
    }
}
