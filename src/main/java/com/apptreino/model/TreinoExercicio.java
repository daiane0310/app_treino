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
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import com.apptreino.dto.SeriePrescritaRequest;

@Entity
@Table(name = "treino_exercicios")
public class TreinoExercicio {

    @Enumerated(EnumType.STRING)
    @Column(name = "formato_prescricao", nullable = false)
    private FormatoPrescricao formatoPrescricao = FormatoPrescricao.LEGADO;

    @OneToMany(mappedBy = "treinoExercicio", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroSerie ASC")
    private List<SeriePrescrita> seriesPrescritas = new ArrayList<>();

    public FormatoPrescricao getFormatoPrescricao() { return formatoPrescricao; }
    public List<SeriePrescrita> getSeriesPrescritas() { return List.copyOf(seriesPrescritas); }

    public void atualizarSeries(List<SeriePrescritaRequest> series) {
        // Reuse numbered rows to avoid unique-constraint collisions during flush.
        while (seriesPrescritas.size() > series.size()) seriesPrescritas.remove(seriesPrescritas.size() - 1);
        for (int i = 0; i < series.size(); i++) {
            var valor = series.get(i);
            if (i < seriesPrescritas.size()) seriesPrescritas.get(i).atualizar(valor.repeticoes(), valor.carga());
            else seriesPrescritas.add(new SeriePrescrita(this, valor.numeroSerie(), valor.repeticoes(), valor.carga()));
        }
        seriesPlanejadas = series.size();
        formatoPrescricao = FormatoPrescricao.POR_SERIE;
    }

    public List<SeriePrescrita> seriesParaSnapshot() {
        if (formatoPrescricao == FormatoPrescricao.POR_SERIE) return getSeriesPrescritas();
        // Legacy text (e.g. 10-12) stays in the general snapshot. Never guess repetitions.
        List<SeriePrescrita> resultado = new ArrayList<>();
        if (seriesPlanejadas != null && seriesPlanejadas > 0) {
            for (int numero = 1; numero <= seriesPlanejadas; numero++) {
                resultado.add(new SeriePrescrita(this, numero, null,
                        cargaPlanejada != null && cargaPlanejada.signum() >= 0 ? cargaPlanejada : null));
            }
        }
        return resultado;
    }

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

    public void atualizarOrdem(Integer ordem) {
        this.ordem = ordem;
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
