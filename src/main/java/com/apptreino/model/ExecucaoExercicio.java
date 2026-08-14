package com.apptreino.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "execucoes_exercicio")
public class ExecucaoExercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "execucao_treino_id", nullable = false)
    private ExecucaoTreino execucaoTreino;

    @ManyToOne(optional = false)
    @JoinColumn(name = "treino_exercicio_id", nullable = false)
    private TreinoExercicio treinoExercicio;

    @Column(name = "exercicio_id_snapshot", nullable = false)
    private Long exercicioIdSnapshot;

    @Column(name = "exercicio_nome_snapshot", nullable = false)
    private String exercicioNomeSnapshot;

    @Column(name = "ordem_planejada", nullable = false)
    private Integer ordemPlanejada;

    @Column(name = "series_planejadas")
    private Integer seriesPlanejadas;

    @Column(name = "repeticoes_planejadas")
    private String repeticoesPlanejadas;

    @Column(name = "carga_planejada", precision = 10, scale = 2)
    private BigDecimal cargaPlanejada;

    @Column(name = "observacoes_prescricao", columnDefinition = "TEXT")
    private String observacoesPrescricao;

    @Column(name = "duracao_segundos")
    private Long duracaoSegundos;

    @Column(name = "observacoes_aluno", columnDefinition = "TEXT")
    private String observacoesAluno;

    public ExecucaoExercicio() {
    }

    public ExecucaoExercicio(ExecucaoTreino execucaoTreino, TreinoExercicio prescricao) {
        this.execucaoTreino = execucaoTreino;
        this.treinoExercicio = prescricao;
        this.exercicioIdSnapshot = prescricao.getExercicio().getId();
        this.exercicioNomeSnapshot = prescricao.getExercicio().getNome();
        this.ordemPlanejada = prescricao.getOrdem();
        this.seriesPlanejadas = prescricao.getSeriesPlanejadas();
        this.repeticoesPlanejadas = prescricao.getRepeticoesPlanejadas();
        this.cargaPlanejada = prescricao.getCargaPlanejada();
        this.observacoesPrescricao = prescricao.getObservacoes();
    }

    public void registrarResultado(Long duracaoSegundos, String observacoesAluno) {
        this.duracaoSegundos = duracaoSegundos;
        this.observacoesAluno = observacoesAluno;
    }

    public Long getId() {
        return id;
    }

    public ExecucaoTreino getExecucaoTreino() {
        return execucaoTreino;
    }

    public TreinoExercicio getTreinoExercicio() {
        return treinoExercicio;
    }

    public Long getExercicioIdSnapshot() {
        return exercicioIdSnapshot;
    }

    public String getExercicioNomeSnapshot() {
        return exercicioNomeSnapshot;
    }

    public Integer getOrdemPlanejada() {
        return ordemPlanejada;
    }

    public Integer getSeriesPlanejadas() {
        return seriesPlanejadas;
    }

    public String getRepeticoesPlanejadas() {
        return repeticoesPlanejadas;
    }

    public BigDecimal getCargaPlanejada() {
        return cargaPlanejada;
    }

    public String getObservacoesPrescricao() {
        return observacoesPrescricao;
    }

    public Long getDuracaoSegundos() {
        return duracaoSegundos;
    }

    public String getObservacoesAluno() {
        return observacoesAluno;
    }
}
