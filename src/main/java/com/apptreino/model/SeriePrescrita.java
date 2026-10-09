package com.apptreino.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "series_prescritas", uniqueConstraints = @UniqueConstraint(
        name = "uk_serie_prescrita_numero", columnNames = {"treino_exercicio_id", "numero_serie"}))
public class SeriePrescrita {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "treino_exercicio_id", nullable = false)
    private TreinoExercicio treinoExercicio;
    @Column(name = "numero_serie", nullable = false)
    private Integer numeroSerie;
    private Integer repeticoes;
    @Column(precision = 10, scale = 2)
    private BigDecimal carga;

    protected SeriePrescrita() { }
    public SeriePrescrita(TreinoExercicio prescricao, Integer numero, Integer repeticoes, BigDecimal carga) {
        this.treinoExercicio = prescricao;
        this.numeroSerie = numero;
        atualizar(repeticoes, carga);
    }
    public void atualizar(Integer repeticoes, BigDecimal carga) {
        this.repeticoes = repeticoes;
        this.carga = carga;
    }
    public Long getId() { return id; }
    public Integer getNumeroSerie() { return numeroSerie; }
    public Integer getRepeticoes() { return repeticoes; }
    public BigDecimal getCarga() { return carga; }
}
