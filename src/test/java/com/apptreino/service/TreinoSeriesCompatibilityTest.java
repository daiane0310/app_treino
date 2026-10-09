package com.apptreino.service;

import com.apptreino.dto.*;
import com.apptreino.model.*;
import com.apptreino.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TreinoSeriesCompatibilityTest {
    @Test void listagemDoAlunoFiltraAtivosSemAlterarListagemDoPersonal() {
        var treinos = mock(TreinoRepository.class);
        var usuarios = mock(UsuarioRepository.class);
        var vinculos = mock(VinculoPersonalAlunoRepository.class);
        var auth = mock(Authentication.class);
        var aluno = new Usuario(1L, "Aluno", "aluno@example.test", "", TipoUsuario.ALUNO);
        when(auth.getName()).thenReturn(aluno.getEmail());
        when(usuarios.findByEmail(aluno.getEmail())).thenReturn(Optional.of(aluno));
        new TreinoService(treinos, usuarios, vinculos).listarTreinosDoAlunoAutenticado(auth);
        verify(treinos).findAllByAlunoIdAndAtivoTrue(1L);
        verify(treinos, never()).findAllByAlunoId(anyLong());
    }
    @Test void atualizarPorSeriePreservaTextoLegadoERejeitaClienteQueOmiteListaDepois() {
        var treinos = mock(TreinoRepository.class);
        var prescricoes = mock(TreinoExercicioRepository.class);
        var usuarios = mock(UsuarioRepository.class);
        var auth = mock(Authentication.class);
        var admin = new Usuario(2L, "Admin", "admin@example.test", "", TipoUsuario.ADMIN);
        when(auth.getName()).thenReturn(admin.getEmail());
        when(usuarios.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        var treino = new Treino();
        var prescricao = new TreinoExercicio(treino, new Exercicio("Supino", null, true), 1, 4, "10-12", new BigDecimal("30"), "Orientação");
        when(treinos.findByIdForUpdate(10L)).thenReturn(Optional.of(treino));
        when(prescricoes.findByIdAndTreinoIdAndAtivoTrue(50L, 10L)).thenReturn(Optional.of(prescricao));
        when(prescricoes.saveAndFlush(prescricao)).thenReturn(prescricao);
        var service = new TreinoExercicioService(prescricoes, treinos, mock(ExercicioRepository.class), usuarios, mock(VinculoPersonalAlunoRepository.class));
        var request = new TreinoExercicioUpdateRequest();
        request.setOrdem(1);
        request.setObservacoes("Orientação");
        request.setSeriesPrescritas(List.of(new SeriePrescritaRequest(1, null, new BigDecimal("30")), new SeriePrescritaRequest(2, 0, null)));
        var response = service.atualizarPrescricao(10L, 50L, request, auth);
        assertEquals(FormatoPrescricao.POR_SERIE, response.getFormatoPrescricao());
        assertEquals("10-12", response.getRepeticoesPlanejadas());
        assertEquals(2, response.getSeriesPlanejadas());
        assertNull(response.getSeriesPrescritas().getFirst().repeticoes());
        request.setSeriesPrescritas(null);
        assertThrows(IllegalArgumentException.class, () -> service.atualizarPrescricao(10L, 50L, request, auth));
        assertEquals(2, prescricao.getSeriesPrescritas().size());
    }
}
