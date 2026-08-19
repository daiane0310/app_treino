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
@Table(name = "treino_exercicios")
public class TreinoExercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "treino_id", nullable = false)
    private Treino treino;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exercicio_id", nullable = false)
    private Exercicio exercicio;

    @Column(nullable = false)
    private Integer ordem;

    @Column(name = "series_planejadas")
    private Integer seriesPlanejadas;

    @Column(name = "repeticoes_planejadas")
    private String repeticoesPlanejadas;

    @Column(name = "carga_planejada", precision = 10, scale = 2)
    private BigDecimal cargaPlanejada;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false)
    private boolean ativo = true;

    public TreinoExercicio() {
    }

    public TreinoExercicio(
            Treino treino,
            Exercicio exercicio,
            Integer ordem,
            Integer seriesPlanejadas,
            String repeticoesPlanejadas,
            BigDecimal cargaPlanejada,
            String observacoes
    ) {
        this.treino = treino;
        this.exercicio = exercicio;
        this.ordem = ordem;
        this.seriesPlanejadas = seriesPlanejadas;
        this.repeticoesPlanejadas = repeticoesPlanejadas;
        this.cargaPlanejada = cargaPlanejada;
        this.observacoes = observacoes;
    }

    public void atualizarPrescricao(
            Integer ordem,
            Integer seriesPlanejadas,
            String repeticoesPlanejadas,
            BigDecimal cargaPlanejada,
            String observacoes
    ) {
        this.ordem = ordem;
        this.seriesPlanejadas = seriesPlanejadas;
        this.repeticoesPlanejadas = repeticoesPlanejadas;
        this.cargaPlanejada = cargaPlanejada;
        this.observacoes = observacoes;
    }

    public void desativar() {
        this.ativo = false;
    }

    public Long getId() {
        return id;
    }

    public Treino getTreino() {
        return treino;
    }

    public Exercicio getExercicio() {
        return exercicio;
    }

    public Integer getOrdem() {
        return ordem;
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

    public String getObservacoes() {
        return observacoes;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
