package com.apptreino.dto;

import com.apptreino.model.ExecucaoTreino;
import com.apptreino.model.StatusExecucaoTreino;

import java.time.Instant;
import java.util.List;

public class ExecucaoTreinoDetalheResponse {

    private final Long id;
    private final Long treinoId;
    private final String treinoNome;
    private final StatusExecucaoTreino status;
    private final Instant iniciadoEm;
    private final Instant finalizadoEm;
    private final Long duracaoSegundos;
    private final String observacoes;
    private final List<ExecucaoExercicioResponse> exercicios;

    public ExecucaoTreinoDetalheResponse(
            ExecucaoTreino execucao,
            List<ExecucaoExercicioResponse> exercicios
    ) {
        this.id = execucao.getId();
        this.treinoId = execucao.getTreino().getId();
        this.treinoNome = execucao.getTreinoNomeSnapshot();
        this.status = execucao.getStatus();
        this.iniciadoEm = execucao.getIniciadoEm();
        this.finalizadoEm = execucao.getFinalizadoEm();
        this.duracaoSegundos = execucao.getDuracaoSegundos();
        this.observacoes = execucao.getObservacoes();
        this.exercicios = exercicios;
    }

    public Long getId() { return id; }
    public Long getTreinoId() { return treinoId; }
    public String getTreinoNome() { return treinoNome; }
    public StatusExecucaoTreino getStatus() { return status; }
    public Instant getIniciadoEm() { return iniciadoEm; }
    public Instant getFinalizadoEm() { return finalizadoEm; }
    public Long getDuracaoSegundos() { return duracaoSegundos; }
    public String getObservacoes() { return observacoes; }
    public List<ExecucaoExercicioResponse> getExercicios() { return exercicios; }
}
