package com.apptreino.controller;

import com.apptreino.dto.LoginRequest;
import com.apptreino.dto.LoginResponse;
import com.apptreino.model.Usuario;
import com.apptreino.repository.UsuarioRepository;
import com.apptreino.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByEmail(loginRequest.getEmail());

        if (usuarioEncontrado.isEmpty()
                || !passwordEncoder.matches(loginRequest.getSenha(), usuarioEncontrado.get().getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "E-mail ou senha inválidos"));
        }

        Usuario usuario = usuarioEncontrado.get();
        String token = jwtService.gerarToken(usuario);

        return ResponseEntity.ok(new LoginResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo(),
                token
        ));
    }
}
