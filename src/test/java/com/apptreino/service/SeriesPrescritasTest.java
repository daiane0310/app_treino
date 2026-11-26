package com.apptreino.service;

import com.apptreino.dto.SeriePrescritaRequest;
import com.apptreino.model.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class SeriesPrescritasTest {
    @Test void aceitaVinteSeriesERejeitaVinteEUma() {
        var vinte = java.util.stream.IntStream.rangeClosed(1, 20)
                .mapToObj(numero -> new SeriePrescritaRequest(numero, null, null)).toList();
        assertDoesNotThrow(() -> SeriesPrescritasValidator.validar(vinte));
        var vinteEUma = java.util.stream.IntStream.rangeClosed(1, 21)
                .mapToObj(numero -> new SeriePrescritaRequest(numero, null, null)).toList();
        var error = assertThrows(IllegalArgumentException.class, () -> SeriesPrescritasValidator.validar(vinteEUma));
        assertEquals("O limite é de 20 séries por exercício", error.getMessage());
    }

    @Test void limiteTambemValidaQuantidadeLegadaSemModificarDados() {
        assertDoesNotThrow(() -> SeriesPrescritasValidator.validarQuantidadeMaxima(null));
        assertDoesNotThrow(() -> SeriesPrescritasValidator.validarQuantidadeMaxima(20));
        assertThrows(IllegalArgumentException.class, () -> SeriesPrescritasValidator.validarQuantidadeMaxima(21));
        var legado = prescricao(21, "8-12", null);
        assertEquals(21, legado.getSeriesPlanejadas());
        assertEquals(21, snapshot(legado).getSeriesPrescritasSnapshot().size());
    }
    private TreinoExercicio prescricao(Integer quantidade, String repeticoes, BigDecimal carga) {
        return new TreinoExercicio(new Treino(), new Exercicio("Supino", null, true), 1,
                quantidade, repeticoes, carga, "Orientação original");
    }
    private ExecucaoExercicio snapshot(TreinoExercicio prescricao) {
        return new ExecucaoExercicio(new ExecucaoTreino(prescricao.getTreino(), new Usuario(), Instant.now()), prescricao);
    }
    @Test void preservaSnapshotMesmoDepoisDeEditarEReduzirPrescricao() {
        var prescricao = prescricao(null, null, null);
        prescricao.atualizarSeries(List.of(new SeriePrescritaRequest(1, 12, new BigDecimal("25")),
                new SeriePrescritaRequest(2, 10, new BigDecimal("27.50")), new SeriePrescritaRequest(3, null, null)));
        var execucao = snapshot(prescricao);
        prescricao.atualizarSeries(List.of(new SeriePrescritaRequest(1, 8, new BigDecimal("30"))));
        assertEquals(3, execucao.getSeriesPrescritasSnapshot().size());
        assertEquals(12, execucao.getSeriesPrescritasSnapshot().getFirst().getRepeticoesPlanejadas());
        assertEquals(new BigDecimal("25"), execucao.getSeriesPrescritasSnapshot().getFirst().getCargaPlanejada());
        assertNull(execucao.getSeriesPrescritasSnapshot().get(2).getCargaPlanejada());
        assertEquals(FormatoPrescricao.POR_SERIE, execucao.getFormatoPrescricao());
        assertEquals(1, prescricao.getSeriesPlanejadas());
    }
    @Test void legadoMantemFaixaSemInventarRepeticoes() {
        var execucao = snapshot(prescricao(4, "10-12", new BigDecimal("30")));
        assertEquals("10-12", execucao.getRepeticoesPlanejadas());
        assertEquals(FormatoPrescricao.LEGADO, execucao.getFormatoPrescricao());
        assertEquals(4, execucao.getSeriesPrescritasSnapshot().size());
        execucao.getSeriesPrescritasSnapshot().forEach(serie -> {
            assertNull(serie.getRepeticoesPlanejadas());
            assertEquals(new BigDecimal("30"), serie.getCargaPlanejada());
        });
    }
    @Test void quantidadeLegadaNulaNaoGeraSeriesInventadas() {
        assertTrue(snapshot(prescricao(null, "10-12", null)).getSeriesPrescritasSnapshot().isEmpty());
    }
    @Test void distingueNullDeZero() {
        assertDoesNotThrow(() -> SeriesPrescritasValidator.validar(List.of(
                new SeriePrescritaRequest(1, null, null), new SeriePrescritaRequest(2, 0, BigDecimal.ZERO))));
    }
    @Test void rejeitaNumeracaoInvalidaEValoresForaDoContrato() {
        for (var series : List.of(List.<SeriePrescritaRequest>of(),
                List.of(new SeriePrescritaRequest(2, null, null)),
                List.of(new SeriePrescritaRequest(1, -1, null)),
                List.of(new SeriePrescritaRequest(1, 1, new BigDecimal("1.001"))),
                List.of(new SeriePrescritaRequest(1, 1, new BigDecimal("100000000"))),
                List.of(new SeriePrescritaRequest(1, 1, new BigDecimal("-1"))),
                List.of(new SeriePrescritaRequest(1, 1, null), new SeriePrescritaRequest(1, 2, null)),
                Arrays.asList((SeriePrescritaRequest) null))) {
            assertThrows(IllegalArgumentException.class, () -> SeriesPrescritasValidator.validar(series));
        }
    }
}
