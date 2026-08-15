package com.apptreino.service;

import com.apptreino.dto.ExercicioCreateRequest;
import com.apptreino.dto.ExercicioResponse;
import com.apptreino.dto.ExercicioUpdateRequest;
import com.apptreino.model.Exercicio;
import com.apptreino.model.TipoUsuario;
import com.apptreino.model.Usuario;
import com.apptreino.repository.ExercicioRepository;
import com.apptreino.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class ExercicioService {

    private final ExercicioRepository exercicioRepository;
    private final UsuarioRepository usuarioRepository;

    public ExercicioService(
            ExercicioRepository exercicioRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.exercicioRepository = exercicioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ExercicioResponse criarExercicio(ExercicioCreateRequest request) {
        validarNome(request.getNome());

        String nome = request.getNome().trim();
        if (exercicioRepository.existsByNomeIgnoreCase(nome)) {
            throw new IllegalStateException("Já existe um exercício com este nome");
        }

        Exercicio exercicio = new Exercicio(nome, request.getDescricao(), request.isAtivo());
        return new ExercicioResponse(exercicioRepository.save(exercicio));
    }

    @Transactional
    public ExercicioResponse atualizarExercicio(
            Long exercicioId,
            ExercicioUpdateRequest request,
            Authentication authentication
    ) {
        Usuario solicitante = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NoSuchElementException(
                        "Usuário autenticado não encontrado"
                ));

        if (solicitante.getTipo() != TipoUsuario.ADMIN
                && solicitante.getTipo() != TipoUsuario.PERSONAL) {
            throw new AccessDeniedException("Usuário sem permissão para editar exercícios");
        }

        Exercicio exercicio = exercicioRepository.findById(exercicioId)
                .orElseThrow(() -> new NoSuchElementException("Exercício não encontrado"));

        validarNome(request == null ? null : request.getNome());
        String nome = request.getNome().trim();

        if (exercicioRepository.existsByNomeIgnoreCaseAndIdNot(nome, exercicioId)) {
            throw new IllegalStateException("Já existe um exercício com este nome");
        }

        exercicio.atualizar(nome, request.getDescricao(), request.isAtivo());
        return new ExercicioResponse(exercicioRepository.saveAndFlush(exercicio));
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do exercício é obrigatório");
        }
    }
}
