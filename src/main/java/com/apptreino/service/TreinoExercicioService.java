package com.apptreino.service;

import com.apptreino.dto.TreinoExercicioCreateRequest;
import com.apptreino.dto.TreinoExercicioResponse;
import com.apptreino.model.Exercicio;
import com.apptreino.model.TipoUsuario;
import com.apptreino.model.Treino;
import com.apptreino.model.TreinoExercicio;
import com.apptreino.model.Usuario;
import com.apptreino.repository.ExercicioRepository;
import com.apptreino.repository.TreinoExercicioRepository;
import com.apptreino.repository.TreinoRepository;
import com.apptreino.repository.UsuarioRepository;
import com.apptreino.repository.VinculoPersonalAlunoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TreinoExercicioService {

    private final TreinoExercicioRepository treinoExercicioRepository;
    private final TreinoRepository treinoRepository;
    private final ExercicioRepository exercicioRepository;
    private final UsuarioRepository usuarioRepository;
    private final VinculoPersonalAlunoRepository vinculoRepository;

    public TreinoExercicioService(
            TreinoExercicioRepository treinoExercicioRepository,
            TreinoRepository treinoRepository,
            ExercicioRepository exercicioRepository,
            UsuarioRepository usuarioRepository,
            VinculoPersonalAlunoRepository vinculoRepository
    ) {
        this.treinoExercicioRepository = treinoExercicioRepository;
        this.treinoRepository = treinoRepository;
        this.exercicioRepository = exercicioRepository;
        this.usuarioRepository = usuarioRepository;
        this.vinculoRepository = vinculoRepository;
    }

    @Transactional
    public TreinoExercicioResponse adicionarExercicio(
            Long treinoId,
            TreinoExercicioCreateRequest request,
            Authentication authentication
    ) {
        validarRequest(request);

        Usuario solicitante = buscarUsuarioAutenticado(authentication);
        Treino treino = buscarTreino(treinoId);
        validarAdministracaoDoTreino(solicitante, treino);

        Exercicio exercicio = exercicioRepository.findById(request.getExercicioId())
                .orElseThrow(() -> new NoSuchElementException("Exercício não encontrado"));

        if (!exercicio.isAtivo()) {
            throw new IllegalArgumentException("Exercício deve estar ativo");
        }

        if (treinoExercicioRepository.existsByTreinoIdAndExercicioId(
                treinoId,
                request.getExercicioId()
        )) {
            throw new IllegalStateException("Exercício já está presente neste treino");
        }

        if (treinoExercicioRepository.existsByTreinoIdAndOrdem(treinoId, request.getOrdem())) {
            throw new IllegalStateException("Ordem já está ocupada neste treino");
        }

        TreinoExercicio treinoExercicio = new TreinoExercicio(
                treino,
                exercicio,
                request.getOrdem(),
                request.getSeriesPlanejadas(),
                normalizarTextoOpcional(request.getRepeticoesPlanejadas()),
                request.getCargaPlanejada(),
                request.getObservacoes()
        );

        try {
            return new TreinoExercicioResponse(
                    treinoExercicioRepository.saveAndFlush(treinoExercicio)
            );
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("Ordem já está ocupada neste treino", exception);
        }
    }

    @Transactional(readOnly = true)
    public List<TreinoExercicioResponse> listarExercicios(
            Long treinoId,
            Authentication authentication
    ) {
        Usuario solicitante = buscarUsuarioAutenticado(authentication);
        Treino treino = buscarTreino(treinoId);
        validarVisualizacaoDoTreino(solicitante, treino);

        return treinoExercicioRepository.findAllByTreinoIdOrderByOrdemAsc(treinoId)
                .stream()
                .map(TreinoExercicioResponse::new)
                .toList();
    }

    private Usuario buscarUsuarioAutenticado(Authentication authentication) {
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NoSuchElementException("Usuário autenticado não encontrado"));
    }

    private Treino buscarTreino(Long treinoId) {
        return treinoRepository.findById(treinoId)
                .orElseThrow(() -> new NoSuchElementException("Treino não encontrado"));
    }

    private void validarAdministracaoDoTreino(Usuario solicitante, Treino treino) {
        if (solicitante.getTipo() == TipoUsuario.ADMIN) {
            return;
        }

        if (solicitante.getTipo() != TipoUsuario.PERSONAL
                || !solicitante.getId().equals(treino.getPersonal().getId())
                || !vinculoRepository.existsByPersonalIdAndAlunoId(
                        solicitante.getId(),
                        treino.getAluno().getId()
                )) {
            throw new AccessDeniedException("Treino não pertence ao personal autenticado");
        }
    }

    private void validarVisualizacaoDoTreino(Usuario solicitante, Treino treino) {
        if (solicitante.getTipo() == TipoUsuario.ADMIN) {
            return;
        }

        if (solicitante.getTipo() == TipoUsuario.PERSONAL) {
            validarAdministracaoDoTreino(solicitante, treino);
            return;
        }

        if (solicitante.getTipo() == TipoUsuario.ALUNO
                && solicitante.getId().equals(treino.getAluno().getId())) {
            return;
        }

        throw new AccessDeniedException("Usuário não possui acesso a este treino");
    }

    private void validarRequest(TreinoExercicioCreateRequest request) {
        if (request.getExercicioId() == null) {
            throw new IllegalArgumentException("Exercício é obrigatório");
        }

        if (request.getOrdem() == null || request.getOrdem() <= 0) {
            throw new IllegalArgumentException("Ordem deve ser maior que zero");
        }

        if (request.getSeriesPlanejadas() != null && request.getSeriesPlanejadas() <= 0) {
            throw new IllegalArgumentException("Séries planejadas devem ser maiores que zero");
        }

        if (request.getRepeticoesPlanejadas() != null
                && request.getRepeticoesPlanejadas().isBlank()) {
            throw new IllegalArgumentException("Repetições planejadas não podem ser vazias");
        }

        BigDecimal carga = request.getCargaPlanejada();
        if (carga != null && carga.signum() < 0) {
            throw new IllegalArgumentException("Carga planejada não pode ser negativa");
        }
    }

    private String normalizarTextoOpcional(String texto) {
        return texto == null ? null : texto.trim();
    }
}
