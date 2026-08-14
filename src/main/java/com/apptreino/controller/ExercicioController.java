package com.apptreino.controller;

import com.apptreino.dto.ExercicioCreateRequest;
import com.apptreino.dto.ExercicioResponse;
import com.apptreino.service.ExercicioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/exercicios")
public class ExercicioController {

    private final ExercicioService exercicioService;

    public ExercicioController(ExercicioService exercicioService) {
        this.exercicioService = exercicioService;
    }

    @PostMapping
    public ResponseEntity<ExercicioResponse> criarExercicio(
            @RequestBody ExercicioCreateRequest request
    ) {
        ExercicioResponse exercicio = exercicioService.criarExercicio(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(exercicio);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarRequisicaoInvalida(
            IllegalArgumentException exception
    ) {
        return respostaErro(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> tratarConflito(IllegalStateException exception) {
        return respostaErro(HttpStatus.CONFLICT, exception.getMessage());
    }

    private ResponseEntity<Map<String, String>> respostaErro(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }
}
