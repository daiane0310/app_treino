package com.apptreino.controller;

import com.apptreino.dto.ExecucaoExercicioResponse;
import com.apptreino.dto.ExecucaoTreinoDetalheResponse;
import com.apptreino.dto.ExecucaoTreinoResponse;
import com.apptreino.dto.RegistrarExecucaoExercicioRequest;
import com.apptreino.service.ExecucaoTreinoService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
public class ExecucaoTreinoController {

    private final ExecucaoTreinoService execucaoTreinoService;

    public ExecucaoTreinoController(ExecucaoTreinoService execucaoTreinoService) {
        this.execucaoTreinoService = execucaoTreinoService;
    }

    @PostMapping("/treinos/{treinoId}/execucoes")
    public ResponseEntity<ExecucaoTreinoResponse> iniciarExecucao(
            @PathVariable Long treinoId,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                execucaoTreinoService.iniciarExecucao(treinoId, authentication)
        );
    }

    @PutMapping("/execucoes/{execucaoId}/exercicios/{execucaoExercicioId}")
    public ResponseEntity<ExecucaoExercicioResponse> registrarExecucaoExercicio(
            @PathVariable Long execucaoId,
            @PathVariable Long execucaoExercicioId,
            @RequestBody RegistrarExecucaoExercicioRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(execucaoTreinoService.registrarExecucaoExercicio(
                execucaoId,
                execucaoExercicioId,
                request,
                authentication
        ));
    }

    @PostMapping("/execucoes/{execucaoId}/finalizar")
    public ResponseEntity<ExecucaoTreinoResponse> finalizarExecucao(
            @PathVariable Long execucaoId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                execucaoTreinoService.finalizarExecucao(execucaoId, authentication)
        );
    }

    @GetMapping("/execucoes/{execucaoId}")
    public ResponseEntity<ExecucaoTreinoDetalheResponse> detalharExecucao(
            @PathVariable Long execucaoId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                execucaoTreinoService.detalharExecucao(execucaoId, authentication)
        );
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
