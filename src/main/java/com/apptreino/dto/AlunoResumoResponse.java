package com.apptreino.dto;

import com.apptreino.model.Usuario;

public class AlunoResumoResponse {

    private final Long id;
    private final String nome;
    private final String email;

    public AlunoResumoResponse(Usuario aluno) {
        this.id = aluno.getId();
        this.nome = aluno.getNome();
        this.email = aluno.getEmail();
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
}
