package com.apptreino.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "execucoes_series_prescritas", uniqueConstraints = @UniqueConstraint(
        name = "uk_snapshot_serie_numero", columnNames = {"execucao_exercicio_id", "numero_serie"}))
public class SeriePrescritaSnapshot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "execucao_exercicio_id", nullable = false, updatable = false)
    private ExecucaoExercicio execucaoExercicio;
    @Column(name = "numero_serie", nullable = false, updatable = false)
    private Integer numeroSerie;
    @Column(name = "repeticoes_planejadas", updatable = false)
    private Integer repeticoesPlanejadas;
    @Column(name = "carga_planejada", precision = 10, scale = 2, updatable = false)
    private BigDecimal cargaPlanejada;

    protected SeriePrescritaSnapshot() { }
    public SeriePrescritaSnapshot(ExecucaoExercicio execucao, SeriePrescrita serie) {
        this.execucaoExercicio = execucao;
        this.numeroSerie = serie.getNumeroSerie();
        this.repeticoesPlanejadas = serie.getRepeticoes();
        this.cargaPlanejada = serie.getCarga();
    }
    public Long getId() { return id; }
    public Integer getNumeroSerie() { return numeroSerie; }
    public Integer getRepeticoesPlanejadas() { return repeticoesPlanejadas; }
    public BigDecimal getCargaPlanejada() { return cargaPlanejada; }
}
