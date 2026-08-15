package com.apptreino.controller;

import com.apptreino.dto.TreinoExercicioCreateRequest;
import com.apptreino.dto.TreinoExercicioResponse;
import com.apptreino.dto.TreinoExercicioUpdateRequest;
import com.apptreino.service.TreinoExercicioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/treinos")
public class TreinoExercicioController {

    private final TreinoExercicioService treinoExercicioService;

    public TreinoExercicioController(TreinoExercicioService treinoExercicioService) {
        this.treinoExercicioService = treinoExercicioService;
    }

    @PostMapping("/{treinoId}/exercicios")
    public ResponseEntity<TreinoExercicioResponse> adicionarExercicio(
            @PathVariable Long treinoId,
            @RequestBody TreinoExercicioCreateRequest request,
            Authentication authentication
    ) {
        TreinoExercicioResponse treinoExercicio =
                treinoExercicioService.adicionarExercicio(treinoId, request, authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(treinoExercicio);
    }

    @GetMapping("/{treinoId}/exercicios")
    public ResponseEntity<List<TreinoExercicioResponse>> listarExercicios(
            @PathVariable Long treinoId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                treinoExercicioService.listarExercicios(treinoId, authentication)
        );
    }

    @PutMapping("/{treinoId}/exercicios/{treinoExercicioId}")
    public ResponseEntity<TreinoExercicioResponse> atualizarPrescricao(
            @PathVariable Long treinoId,
            @PathVariable Long treinoExercicioId,
            @RequestBody TreinoExercicioUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(treinoExercicioService.atualizarPrescricao(
                treinoId,
                treinoExercicioId,
                request,
                authentication
        ));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> tratarNaoEncontrado(NoSuchElementException exception) {
        return respostaErro(HttpStatus.NOT_FOUND, exception.getMessage());
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

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> tratarAcessoNegado(AccessDeniedException exception) {
        return respostaErro(HttpStatus.FORBIDDEN, exception.getMessage());
    }

    private ResponseEntity<Map<String, String>> respostaErro(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }
}
