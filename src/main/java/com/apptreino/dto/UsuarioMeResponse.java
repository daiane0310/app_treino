package com.apptreino.dto;

import com.apptreino.model.TipoUsuario;

public class UsuarioMeResponse {

    private final Long id;
    private final String nome;
    private final String email;
    private final TipoUsuario tipo;

    public UsuarioMeResponse(Long id, String nome, String email, TipoUsuario tipo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
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
}
