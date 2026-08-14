package com.apptreino.controller;

import com.apptreino.dto.TreinoCreateRequest;
import com.apptreino.dto.TreinoResponse;
import com.apptreino.service.TreinoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/alunos")
public class TreinoController {

    private final TreinoService treinoService;

    public TreinoController(TreinoService treinoService) {
        this.treinoService = treinoService;
    }

    @PostMapping("/{alunoId}/treinos")
    public ResponseEntity<TreinoResponse> criarTreino(
            @PathVariable Long alunoId,
            @RequestBody TreinoCreateRequest request,
            Authentication authentication
    ) {
        TreinoResponse treino = treinoService.criarTreino(alunoId, request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(treino);
    }

    @GetMapping("/{alunoId}/treinos")
    public ResponseEntity<List<TreinoResponse>> listarTreinosDoAluno(
            @PathVariable Long alunoId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(treinoService.listarTreinosDoAluno(alunoId, authentication));
    }

    @GetMapping("/me/treinos")
    public ResponseEntity<List<TreinoResponse>> listarMeusTreinos(
            Authentication authentication
    ) {
        return ResponseEntity.ok(treinoService.listarTreinosDoAlunoAutenticado(authentication));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> tratarNaoEncontrado(NoSuchElementException exception) {
        return respostaErro(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarRequisicaoInvalida(IllegalArgumentException exception) {
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
