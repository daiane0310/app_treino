package com.apptreino.dto;

import com.apptreino.model.Treino;

import java.time.LocalDateTime;

public class TreinoResponse {

    private final Long id;
    private final String nome;
    private final String descricao;
    private final boolean ativo;
    private final Long alunoId;
    private final String alunoNome;
    private final Long personalId;
    private final String personalNome;
    private final LocalDateTime criadoEm;
    private final LocalDateTime atualizadoEm;

    public TreinoResponse(Treino treino) {
        this.id = treino.getId();
        this.nome = treino.getNome();
        this.descricao = treino.getDescricao();
        this.ativo = treino.isAtivo();
        this.alunoId = treino.getAluno().getId();
        this.alunoNome = treino.getAluno().getNome();
        this.personalId = treino.getPersonal().getId();
        this.personalNome = treino.getPersonal().getNome();
        this.criadoEm = treino.getCriadoEm();
        this.atualizadoEm = treino.getAtualizadoEm();
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

    public Long getAlunoId() {
        return alunoId;
    }

    public String getAlunoNome() {
        return alunoNome;
    }

    public Long getPersonalId() {
        return personalId;
    }

    public String getPersonalNome() {
        return personalNome;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
