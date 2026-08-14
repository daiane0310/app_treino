package com.apptreino.controller;

import com.apptreino.dto.AlunoResumoResponse;
import com.apptreino.dto.VinculoPersonalAlunoResponse;
import com.apptreino.model.VinculoPersonalAluno;
import com.apptreino.service.VinculoPersonalAlunoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.List;

@RestController
@RequestMapping("/personais")
public class VinculoPersonalAlunoController {

    private final VinculoPersonalAlunoService vinculoService;

    public VinculoPersonalAlunoController(VinculoPersonalAlunoService vinculoService) {
        this.vinculoService = vinculoService;
    }

    @PostMapping("/{personalId}/alunos/{alunoId}")
    public ResponseEntity<VinculoPersonalAlunoResponse> criarVinculo(
            @PathVariable Long personalId,
            @PathVariable Long alunoId,
            Authentication authentication
    ) {
        VinculoPersonalAluno vinculo =
                vinculoService.criarVinculo(personalId, alunoId, authentication);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new VinculoPersonalAlunoResponse(vinculo));
    }

    @GetMapping("/me/alunos")
    public ResponseEntity<List<AlunoResumoResponse>> listarMeusAlunos(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                vinculoService.listarAlunosDoPersonalAutenticado(authentication)
        );
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
