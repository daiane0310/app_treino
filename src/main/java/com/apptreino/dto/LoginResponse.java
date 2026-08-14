package com.apptreino.dto;

import com.apptreino.model.TipoUsuario;

public class LoginResponse {

    private Long id;
    private String nome;
    private String email;
    private TipoUsuario tipo;
    private String token;

    public LoginResponse(Long id, String nome, String email, TipoUsuario tipo, String token) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public TipoUsuario getTipo() {
        return tipo;
    }

    public String getToken() {
        return token;
    }
}
