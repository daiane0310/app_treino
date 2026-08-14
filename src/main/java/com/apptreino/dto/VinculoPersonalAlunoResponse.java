package com.apptreino.dto;

import com.apptreino.model.VinculoPersonalAluno;

import java.time.LocalDateTime;

public class VinculoPersonalAlunoResponse {

    private final Long id;
    private final Long personalId;
    private final String personalNome;
    private final Long alunoId;
    private final String alunoNome;
    private final LocalDateTime criadoEm;

    public VinculoPersonalAlunoResponse(VinculoPersonalAluno vinculo) {
        this.id = vinculo.getId();
        this.personalId = vinculo.getPersonal().getId();
        this.personalNome = vinculo.getPersonal().getNome();
        this.alunoId = vinculo.getAluno().getId();
        this.alunoNome = vinculo.getAluno().getNome();
        this.criadoEm = vinculo.getCriadoEm();
    }

    public Long getId() {
        return id;
    }

    public Long getPersonalId() {
        return personalId;
    }

    public String getPersonalNome() {
        return personalNome;
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public String getAlunoNome() {
        return alunoNome;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
