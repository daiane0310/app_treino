package com.apptreino.controller;

import com.apptreino.dto.UsuarioMeResponse;
import com.apptreino.model.Usuario;
import com.apptreino.repository.UsuarioRepository;
import com.apptreino.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UsuarioService usuarioService;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder,
            UsuarioService usuarioService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "E-mail já cadastrado"));
        }

        usuario.setId(null);
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        Usuario usuarioCriado = usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCriado);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioMeResponse> buscarUsuarioAutenticado(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioAutenticado(authentication));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> tratarNaoEncontrado(NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("erro", exception.getMessage()));
    }
}
