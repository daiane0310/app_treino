package com.apptreino.service;

import com.apptreino.dto.*;
import com.apptreino.model.*;
import com.apptreino.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExecucaoSeriesServiceTest {
    @Mock ExecucaoTreinoRepository execucoes;
    @Mock ExecucaoExercicioRepository exercicios;
    @Mock ExecucaoSerieRepository series;
    @Mock TreinoRepository treinos;
    @Mock TreinoExercicioRepository prescricoes;
    @Mock UsuarioRepository usuarios;
    @Mock VinculoPersonalAlunoRepository vinculos;
    @Mock Authentication auth;
    @InjectMocks ExecucaoTreinoService service;
    Usuario aluno;
    Treino treino;
    @BeforeEach void setup() {
        aluno = new Usuario(1L, "Aluno", "aluno@example.test", "", TipoUsuario.ALUNO);
        treino = new Treino("Treino A", null, aluno, new Usuario(), true);
        ReflectionTestUtils.setField(treino, "id", 10L);
        when(auth.getName()).thenReturn(aluno.getEmail());
        when(usuarios.findByEmail(aluno.getEmail())).thenReturn(Optional.of(aluno));
    }
    @Test void inicioUsaLockECriaSnapshotSemResultados() {
        var prescricao = new TreinoExercicio(treino, new Exercicio("Supino", null, true), 1, null, null, null, null);
        prescricao.atualizarSeries(List.of(new SeriePrescritaRequest(1, 12, new BigDecimal("25"))));
        when(treinos.findByIdForUpdate(10L)).thenReturn(Optional.of(treino));
        when(execucoes.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(prescricoes.findAllByTreinoIdAndAtivoTrueOrderByOrdemAsc(10L)).thenReturn(List.of(prescricao));
        service.iniciarExecucao(10L, auth);
        verify(treinos).findByIdForUpdate(10L);
        verify(exercicios).saveAll(argThat(values -> {
            var value = values.iterator().next();
            return value.getSeriesPrescritasSnapshot().size() == 1
                    && value.getSeriesPrescritasSnapshot().getFirst().getRepeticoesPlanejadas() == 12;
        }));
        verifyNoInteractions(series);
    }
    @Test void bloqueiaInicioInativo() {
        treino.atualizar("Treino A", null, false);
        when(treinos.findByIdForUpdate(10L)).thenReturn(Optional.of(treino));
        assertThrows(IllegalStateException.class, () -> service.iniciarExecucao(10L, auth));
        verify(execucoes, never()).save(any());
    }
    @Test void resultadosMantemSnapshotEPermitemTreinoDesativado() {
        var prescricao = new TreinoExercicio(treino, new Exercicio("Supino", null, true), 1, null, null, null, null);
        prescricao.atualizarSeries(List.of(new SeriePrescritaRequest(1, 12, new BigDecimal("25"))));
        var execucao = new ExecucaoTreino(treino, aluno, Instant.now());
        var exercicio = new ExecucaoExercicio(execucao, prescricao);
        treino.atualizar("Treino A", null, false);
        when(execucoes.findById(20L)).thenReturn(Optional.of(execucao));
        when(exercicios.findByIdAndExecucaoTreinoId(30L, 20L)).thenReturn(Optional.of(exercicio));
        var primeira = new ExecucaoSerieRequest();
        primeira.setNumeroSerie(1); primeira.setRepeticoes(10); primeira.setCargaUtilizada(new BigDecimal("27.5"));
        var segunda = new ExecucaoSerieRequest();
        segunda.setNumeroSerie(2); segunda.setRepeticoes(0); segunda.setCargaUtilizada(null);
        var request = new RegistrarExecucaoExercicioRequest();
        request.setSeries(List.of(primeira, segunda));
        service.registrarExecucaoExercicio(20L, 30L, request, auth);
        verify(series).saveAllAndFlush(argThat(values -> {
            var iterator = values.iterator();
            var first = iterator.next(); var second = iterator.next();
            return first.getRepeticoes() == 10 && second.getRepeticoes() == 0 && second.getCargaUtilizada() == null && !iterator.hasNext();
        }));
        assertEquals(12, exercicio.getSeriesPrescritasSnapshot().getFirst().getRepeticoesPlanejadas());
        assertEquals(new BigDecimal("25"), exercicio.getSeriesPrescritasSnapshot().getFirst().getCargaPlanejada());
    }
}
