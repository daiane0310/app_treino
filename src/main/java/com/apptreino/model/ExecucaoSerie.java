package com.apptreino.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;

@Entity
@Table(
        name = "execucoes_series",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_execucao_exercicio_numero_serie",
                columnNames = {"execucao_exercicio_id", "numero_serie"}
        )
)
public class ExecucaoSerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "execucao_exercicio_id", nullable = false)
    private ExecucaoExercicio execucaoExercicio;

    @Column(name = "numero_serie", nullable = false)
    private Integer numeroSerie;

    private Integer repeticoes;

    @Column(name = "carga_utilizada", precision = 10, scale = 2)
    private BigDecimal cargaUtilizada;

    @Column(name = "duracao_segundos")
    private Long duracaoSegundos;

    @Column(nullable = false)
    private boolean concluida;

    public ExecucaoSerie() {
    }

    public ExecucaoSerie(
            ExecucaoExercicio execucaoExercicio,
            Integer numeroSerie,
            Integer repeticoes,
            BigDecimal cargaUtilizada,
            Long duracaoSegundos,
            boolean concluida
    ) {
        this.execucaoExercicio = execucaoExercicio;
        this.numeroSerie = numeroSerie;
        this.repeticoes = repeticoes;
        this.cargaUtilizada = cargaUtilizada;
        this.duracaoSegundos = duracaoSegundos;
        this.concluida = concluida;
    }

    public Long getId() {
        return id;
    }

    public ExecucaoExercicio getExecucaoExercicio() {
        return execucaoExercicio;
    }

    public Integer getNumeroSerie() {
        return numeroSerie;
    }

    public Integer getRepeticoes() {
        return repeticoes;
    }

    public BigDecimal getCargaUtilizada() {
        return cargaUtilizada;
    }

    public Long getDuracaoSegundos() {
        return duracaoSegundos;
    }

    public boolean isConcluida() {
        return concluida;
    }
}
