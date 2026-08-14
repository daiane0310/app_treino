package com.apptreino.dto;

import com.apptreino.model.Exercicio;

import java.time.LocalDateTime;

public class ExercicioResponse {

    private final Long id;
    private final String nome;
    private final String descricao;
    private final boolean ativo;
    private final LocalDateTime criadoEm;
    private final LocalDateTime atualizadoEm;

    public ExercicioResponse(Exercicio exercicio) {
        this.id = exercicio.getId();
        this.nome = exercicio.getNome();
        this.descricao = exercicio.getDescricao();
        this.ativo = exercicio.isAtivo();
        this.criadoEm = exercicio.getCriadoEm();
        this.atualizadoEm = exercicio.getAtualizadoEm();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
