package com.apptreino.service;

import com.apptreino.dto.AlunoResumoResponse;
import com.apptreino.model.TipoUsuario;
import com.apptreino.model.Usuario;
import com.apptreino.model.VinculoPersonalAluno;
import com.apptreino.repository.UsuarioRepository;
import com.apptreino.repository.VinculoPersonalAlunoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.List;

@Service
public class VinculoPersonalAlunoService {

    private final UsuarioRepository usuarioRepository;
    private final VinculoPersonalAlunoRepository vinculoRepository;

    public VinculoPersonalAlunoService(
            UsuarioRepository usuarioRepository,
            VinculoPersonalAlunoRepository vinculoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.vinculoRepository = vinculoRepository;
    }

    @Transactional
    public VinculoPersonalAluno criarVinculo(
            Long personalId,
            Long alunoId,
            Authentication authentication
    ) {
        Usuario solicitante = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NoSuchElementException("Usuário autenticado não encontrado"));

        Usuario personal = usuarioRepository.findById(personalId)
                .orElseThrow(() -> new NoSuchElementException("Personal não encontrado"));
        Usuario aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new NoSuchElementException("Aluno não encontrado"));

        if (personal.getId().equals(aluno.getId())) {
            throw new IllegalArgumentException("Personal e aluno não podem ser o mesmo usuário");
        }

        if (personal.getTipo() != TipoUsuario.PERSONAL) {
            throw new IllegalArgumentException("O usuário informado como personal deve ter tipo PERSONAL");
        }

        if (aluno.getTipo() != TipoUsuario.ALUNO) {
            throw new IllegalArgumentException("O usuário informado como aluno deve ter tipo ALUNO");
        }

        validarPermissao(solicitante, personal);

        if (vinculoRepository.existsByAlunoId(alunoId)) {
            throw new IllegalStateException("Aluno já possui vínculo com um personal");
        }

        try {
            return vinculoRepository.saveAndFlush(new VinculoPersonalAluno(personal, aluno));
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("Aluno já possui vínculo com um personal", exception);
        }
    }

    @Transactional(readOnly = true)
    public List<AlunoResumoResponse> listarAlunosDoPersonalAutenticado(
            Authentication authentication
    ) {
        Usuario personal = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NoSuchElementException("Usuário autenticado não encontrado"));

        if (personal.getTipo() != TipoUsuario.PERSONAL) {
            throw new AccessDeniedException("Acesso permitido somente para PERSONAL");
        }

        return vinculoRepository.findAllByPersonalId(personal.getId())
                .stream()
                .map(vinculo -> new AlunoResumoResponse(vinculo.getAluno()))
                .toList();
    }

    private void validarPermissao(Usuario solicitante, Usuario personal) {
        if (solicitante.getTipo() == TipoUsuario.ADMIN) {
            return;
        }

        if (solicitante.getTipo() != TipoUsuario.PERSONAL
                || !solicitante.getId().equals(personal.getId())) {
            throw new AccessDeniedException(
                    "PERSONAL só pode criar vínculo usando seu próprio usuário"
            );
        }
    }
}
