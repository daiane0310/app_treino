package com.apptreino.service;

import com.apptreino.dto.TreinoCreateRequest;
import com.apptreino.dto.TreinoResponse;
import com.apptreino.model.TipoUsuario;
import com.apptreino.model.Treino;
import com.apptreino.model.Usuario;
import com.apptreino.model.VinculoPersonalAluno;
import com.apptreino.repository.TreinoRepository;
import com.apptreino.repository.UsuarioRepository;
import com.apptreino.repository.VinculoPersonalAlunoRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TreinoService {

    private final TreinoRepository treinoRepository;
    private final UsuarioRepository usuarioRepository;
    private final VinculoPersonalAlunoRepository vinculoRepository;

    public TreinoService(
            TreinoRepository treinoRepository,
            UsuarioRepository usuarioRepository,
            VinculoPersonalAlunoRepository vinculoRepository
    ) {
        this.treinoRepository = treinoRepository;
        this.usuarioRepository = usuarioRepository;
        this.vinculoRepository = vinculoRepository;
    }

    @Transactional
    public TreinoResponse criarTreino(
            Long alunoId,
            TreinoCreateRequest request,
            Authentication authentication
    ) {
        validarNome(request.getNome());

        Usuario solicitante = buscarUsuarioAutenticado(authentication);
        Usuario aluno = buscarAluno(alunoId);
        VinculoPersonalAluno vinculo = vinculoRepository.findByAlunoId(alunoId)
                .orElseThrow(() -> new IllegalStateException("Aluno não possui vínculo com um personal"));

        Usuario personal = definirPersonalDoTreino(solicitante, vinculo);
        Treino treino = new Treino(
                request.getNome().trim(),
                request.getDescricao(),
                aluno,
                personal,
                request.isAtivo()
        );

        return new TreinoResponse(treinoRepository.save(treino));
    }

    @Transactional(readOnly = true)
    public List<TreinoResponse> listarTreinosDoAluno(
            Long alunoId,
            Authentication authentication
    ) {
        Usuario solicitante = buscarUsuarioAutenticado(authentication);
        buscarAluno(alunoId);

        List<Treino> treinos;

        if (solicitante.getTipo() == TipoUsuario.ADMIN) {
            treinos = treinoRepository.findAllByAlunoId(alunoId);
        } else if (solicitante.getTipo() == TipoUsuario.PERSONAL) {
            if (!vinculoRepository.existsByPersonalIdAndAlunoId(solicitante.getId(), alunoId)) {
                throw new AccessDeniedException("Aluno não está vinculado ao personal autenticado");
            }
            treinos = treinoRepository.findAllByPersonalIdAndAlunoId(solicitante.getId(), alunoId);
        } else {
            throw new AccessDeniedException("Usuário sem permissão para consultar estes treinos");
        }

        return converterParaResponse(treinos);
    }

    @Transactional(readOnly = true)
    public List<TreinoResponse> listarTreinosDoAlunoAutenticado(Authentication authentication) {
        Usuario aluno = buscarUsuarioAutenticado(authentication);

        if (aluno.getTipo() != TipoUsuario.ALUNO) {
            throw new AccessDeniedException("Acesso permitido somente para ALUNO");
        }

        return converterParaResponse(treinoRepository.findAllByAlunoId(aluno.getId()));
    }

    private Usuario buscarUsuarioAutenticado(Authentication authentication) {
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NoSuchElementException("Usuário autenticado não encontrado"));
    }

    private Usuario buscarAluno(Long alunoId) {
        Usuario aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new NoSuchElementException("Aluno não encontrado"));

        if (aluno.getTipo() != TipoUsuario.ALUNO) {
            throw new IllegalArgumentException("O usuário informado deve ter tipo ALUNO");
        }

        return aluno;
    }

    private Usuario definirPersonalDoTreino(
            Usuario solicitante,
            VinculoPersonalAluno vinculo
    ) {
        if (solicitante.getTipo() == TipoUsuario.ADMIN) {
            return vinculo.getPersonal();
        }

        if (solicitante.getTipo() == TipoUsuario.PERSONAL
                && solicitante.getId().equals(vinculo.getPersonal().getId())) {
            return solicitante;
        }

        throw new AccessDeniedException("Aluno não está vinculado ao personal autenticado");
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do treino é obrigatório");
        }
    }

    private List<TreinoResponse> converterParaResponse(List<Treino> treinos) {
        return treinos.stream()
                .map(TreinoResponse::new)
                .toList();
    }
}
