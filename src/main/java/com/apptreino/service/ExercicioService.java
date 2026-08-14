package com.apptreino.service;

import com.apptreino.dto.ExercicioCreateRequest;
import com.apptreino.dto.ExercicioResponse;
import com.apptreino.model.Exercicio;
import com.apptreino.repository.ExercicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExercicioService {

    private final ExercicioRepository exercicioRepository;

    public ExercicioService(ExercicioRepository exercicioRepository) {
        this.exercicioRepository = exercicioRepository;
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

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do exercício é obrigatório");
        }
    }
}
