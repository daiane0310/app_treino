package com.apptreino.service;

import com.apptreino.dto.ExecucaoExercicioResponse;
import com.apptreino.dto.ExecucaoSerieRequest;
import com.apptreino.dto.ExecucaoSerieResponse;
import com.apptreino.dto.ExecucaoTreinoDetalheResponse;
import com.apptreino.dto.ExecucaoTreinoResponse;
import com.apptreino.dto.RegistrarExecucaoExercicioRequest;
import com.apptreino.model.ExecucaoExercicio;
import com.apptreino.model.ExecucaoSerie;
import com.apptreino.model.ExecucaoTreino;
import com.apptreino.model.StatusExecucaoTreino;
import com.apptreino.model.TipoUsuario;
import com.apptreino.model.Treino;
import com.apptreino.model.Usuario;
import com.apptreino.repository.ExecucaoExercicioRepository;
import com.apptreino.repository.ExecucaoSerieRepository;
import com.apptreino.repository.ExecucaoTreinoRepository;
import com.apptreino.repository.TreinoExercicioRepository;
import com.apptreino.repository.TreinoRepository;
import com.apptreino.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class ExecucaoTreinoService {

    private final ExecucaoTreinoRepository execucaoTreinoRepository;
    private final ExecucaoExercicioRepository execucaoExercicioRepository;
    private final ExecucaoSerieRepository execucaoSerieRepository;
    private final TreinoRepository treinoRepository;
    private final TreinoExercicioRepository treinoExercicioRepository;
    private final UsuarioRepository usuarioRepository;

    public ExecucaoTreinoService(
            ExecucaoTreinoRepository execucaoTreinoRepository,
            ExecucaoExercicioRepository execucaoExercicioRepository,
            ExecucaoSerieRepository execucaoSerieRepository,
            TreinoRepository treinoRepository,
            TreinoExercicioRepository treinoExercicioRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.execucaoTreinoRepository = execucaoTreinoRepository;
        this.execucaoExercicioRepository = execucaoExercicioRepository;
        this.execucaoSerieRepository = execucaoSerieRepository;
        this.treinoRepository = treinoRepository;
        this.treinoExercicioRepository = treinoExercicioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ExecucaoTreinoResponse iniciarExecucao(Long treinoId, Authentication authentication) {
        Usuario aluno = buscarAlunoAutenticado(authentication);
        Treino treino = treinoRepository.findById(treinoId)
                .orElseThrow(() -> new NoSuchElementException("Treino não encontrado"));

        if (!treino.getAluno().getId().equals(aluno.getId())) {
            throw new AccessDeniedException("Treino não pertence ao aluno autenticado");
        }

        if (!treino.isAtivo()) {
            throw new IllegalStateException("Treino está inativo");
        }

        if (execucaoTreinoRepository.existsByTreinoIdAndAlunoIdAndStatus(
                treinoId,
                aluno.getId(),
                StatusExecucaoTreino.EM_ANDAMENTO
        )) {
            throw new IllegalStateException("Já existe uma execução em andamento para este treino");
        }

        ExecucaoTreino execucao = execucaoTreinoRepository.save(
                new ExecucaoTreino(treino, aluno, Instant.now())
        );

        List<ExecucaoExercicio> snapshots = treinoExercicioRepository
                .findAllByTreinoIdOrderByOrdemAsc(treinoId)
                .stream()
                .map(prescricao -> new ExecucaoExercicio(execucao, prescricao))
                .toList();

        execucaoExercicioRepository.saveAll(snapshots);
        return new ExecucaoTreinoResponse(execucao);
    }

    @Transactional
    public ExecucaoExercicioResponse registrarExecucaoExercicio(
            Long execucaoId,
            Long execucaoExercicioId,
            RegistrarExecucaoExercicioRequest request,
            Authentication authentication
    ) {
        if (request == null) {
            throw new IllegalArgumentException("Dados da execução são obrigatórios");
        }

        Usuario aluno = buscarAlunoAutenticado(authentication);
        ExecucaoTreino execucao = buscarExecucao(execucaoId);
        validarPropriedadeDoAluno(execucao, aluno);
        validarEmAndamento(execucao);

        ExecucaoExercicio execucaoExercicio = execucaoExercicioRepository
                .findByIdAndExecucaoTreinoId(execucaoExercicioId, execucaoId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Exercício não pertence à execução informada"
                ));

        validarRegistro(request);
        List<ExecucaoSerieRequest> seriesRequest = request.getSeries() == null
                ? List.of()
                : request.getSeries();

        execucaoSerieRepository.deleteAllByExecucaoExercicioId(execucaoExercicioId);
        execucaoSerieRepository.flush();

        List<ExecucaoSerie> novasSeries = seriesRequest.stream()
                .map(serie -> new ExecucaoSerie(
                        execucaoExercicio,
                        serie.getNumeroSerie(),
                        serie.getRepeticoes(),
                        serie.getCargaUtilizada(),
                        serie.getDuracaoSegundos(),
                        serie.isConcluida()
                ))
                .toList();

        execucaoSerieRepository.saveAllAndFlush(novasSeries);
        execucaoExercicio.registrarResultado(
                request.getDuracaoSegundos(),
                request.getObservacoesAluno()
        );

        List<ExecucaoSerieResponse> seriesResponse = execucaoSerieRepository
                .findAllByExecucaoExercicioIdOrderByNumeroSerieAsc(execucaoExercicioId)
                .stream()
                .map(ExecucaoSerieResponse::new)
                .toList();

        return new ExecucaoExercicioResponse(execucaoExercicio, seriesResponse);
    }

    @Transactional
    public ExecucaoTreinoResponse finalizarExecucao(
            Long execucaoId,
            Authentication authentication
    ) {
        Usuario aluno = buscarAlunoAutenticado(authentication);
        ExecucaoTreino execucao = buscarExecucao(execucaoId);
        validarPropriedadeDoAluno(execucao, aluno);
        validarEmAndamento(execucao);

        execucao.finalizar(Instant.now());
        return new ExecucaoTreinoResponse(execucao);
    }

    @Transactional(readOnly = true)
    public ExecucaoTreinoDetalheResponse detalharExecucao(
            Long execucaoId,
            Authentication authentication
    ) {
        Usuario solicitante = buscarUsuarioAutenticado(authentication);
        ExecucaoTreino execucao = buscarExecucao(execucaoId);

        if (solicitante.getTipo() != TipoUsuario.ADMIN) {
            if (solicitante.getTipo() != TipoUsuario.ALUNO
                    || !execucao.getAluno().getId().equals(solicitante.getId())) {
                throw new AccessDeniedException("Usuário não possui acesso a esta execução");
            }
        }

        List<ExecucaoExercicioResponse> exercicios = execucaoExercicioRepository
                .findAllByExecucaoTreinoIdOrderByOrdemPlanejadaAsc(execucaoId)
                .stream()
                .map(execucaoExercicio -> new ExecucaoExercicioResponse(
                        execucaoExercicio,
                        execucaoSerieRepository
                                .findAllByExecucaoExercicioIdOrderByNumeroSerieAsc(
                                        execucaoExercicio.getId()
                                )
                                .stream()
                                .map(ExecucaoSerieResponse::new)
                                .toList()
                ))
                .toList();

        return new ExecucaoTreinoDetalheResponse(execucao, exercicios);
    }

    private Usuario buscarAlunoAutenticado(Authentication authentication) {
        Usuario usuario = buscarUsuarioAutenticado(authentication);
        if (usuario.getTipo() != TipoUsuario.ALUNO) {
            throw new AccessDeniedException("Apenas alunos podem executar treinos");
        }
        return usuario;
    }

    private Usuario buscarUsuarioAutenticado(Authentication authentication) {
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NoSuchElementException(
                        "Usuário autenticado não encontrado"
                ));
    }

    private ExecucaoTreino buscarExecucao(Long execucaoId) {
        return execucaoTreinoRepository.findById(execucaoId)
                .orElseThrow(() -> new NoSuchElementException("Execução não encontrada"));
    }

    private void validarPropriedadeDoAluno(ExecucaoTreino execucao, Usuario aluno) {
        if (!execucao.getAluno().getId().equals(aluno.getId())) {
            throw new AccessDeniedException("Execução não pertence ao aluno autenticado");
        }
    }

    private void validarEmAndamento(ExecucaoTreino execucao) {
        if (execucao.getStatus() != StatusExecucaoTreino.EM_ANDAMENTO) {
            throw new IllegalStateException("Execução não está em andamento");
        }
    }

    private void validarRegistro(RegistrarExecucaoExercicioRequest request) {
        if (request.getDuracaoSegundos() != null && request.getDuracaoSegundos() < 0) {
            throw new IllegalArgumentException("Duração do exercício não pode ser negativa");
        }

        if (request.getSeries() == null) {
            return;
        }

        Set<Integer> numerosSeries = new HashSet<>();
        for (ExecucaoSerieRequest serie : request.getSeries()) {
            if (serie == null) {
                throw new IllegalArgumentException("Série não pode ser nula");
            }
            if (serie.getNumeroSerie() == null || serie.getNumeroSerie() <= 0) {
                throw new IllegalArgumentException("Número da série deve ser maior que zero");
            }
            if (!numerosSeries.add(serie.getNumeroSerie())) {
                throw new IllegalArgumentException("Número da série não pode se repetir");
            }
            if (serie.getRepeticoes() != null && serie.getRepeticoes() < 0) {
                throw new IllegalArgumentException("Repetições não podem ser negativas");
            }
            if (serie.getCargaUtilizada() != null
                    && serie.getCargaUtilizada().signum() < 0) {
                throw new IllegalArgumentException("Carga utilizada não pode ser negativa");
            }
            if (serie.getDuracaoSegundos() != null && serie.getDuracaoSegundos() < 0) {
                throw new IllegalArgumentException("Duração da série não pode ser negativa");
            }
        }
    }
}
