package com.apptreino.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class TesteAuthController {

    @GetMapping("/teste")
    public ResponseEntity<Map<String, String>> testarAutenticacao() {
        return ResponseEntity.ok(Map.of("mensagem", "Token válido"));
    }

    @GetMapping("/teste-admin")
    public ResponseEntity<Map<String, String>> testarAcessoAdmin() {
        return ResponseEntity.ok(Map.of(
                "mensagem", "Acesso de administrador autorizado"
        ));
    }
}
