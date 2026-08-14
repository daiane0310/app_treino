package com.apptreino.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Duration;
import java.time.Instant;

@Entity
@Table(name = "execucoes_treino")
public class ExecucaoTreino {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "treino_id", nullable = false)
    private Treino treino;

    @ManyToOne(optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @Column(name = "treino_nome_snapshot", nullable = false)
    private String treinoNomeSnapshot;

    @Column(name = "iniciado_em", nullable = false, updatable = false)
    private Instant iniciadoEm;

    @Column(name = "finalizado_em")
    private Instant finalizadoEm;

    @Column(name = "duracao_segundos")
    private Long duracaoSegundos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusExecucaoTreino status;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public ExecucaoTreino() {
    }

    public ExecucaoTreino(Treino treino, Usuario aluno, Instant iniciadoEm) {
        this.treino = treino;
        this.aluno = aluno;
        this.treinoNomeSnapshot = treino.getNome();
        this.iniciadoEm = iniciadoEm;
        this.status = StatusExecucaoTreino.EM_ANDAMENTO;
    }

    public void finalizar(Instant finalizadoEm) {
        this.finalizadoEm = finalizadoEm;
        this.duracaoSegundos = Duration.between(iniciadoEm, finalizadoEm).getSeconds();
        this.status = StatusExecucaoTreino.CONCLUIDO;
    }

    public Long getId() {
        return id;
    }

    public Treino getTreino() {
        return treino;
    }

    public Usuario getAluno() {
        return aluno;
    }

    public String getTreinoNomeSnapshot() {
        return treinoNomeSnapshot;
    }

    public Instant getIniciadoEm() {
        return iniciadoEm;
    }

    public Instant getFinalizadoEm() {
        return finalizadoEm;
    }

    public Long getDuracaoSegundos() {
        return duracaoSegundos;
    }

    public StatusExecucaoTreino getStatus() {
        return status;
    }

    public String getObservacoes() {
        return observacoes;
    }
}
