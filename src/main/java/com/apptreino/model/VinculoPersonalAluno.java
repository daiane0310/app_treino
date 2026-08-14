package com.apptreino.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "vinculos_personal_aluno")
public class VinculoPersonalAluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "personal_id", nullable = false)
    private Usuario personal;

    @OneToOne(optional = false)
    @JoinColumn(name = "aluno_id", nullable = false, unique = true)
    private Usuario aluno;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    public VinculoPersonalAluno() {
    }

    public VinculoPersonalAluno(Usuario personal, Usuario aluno) {
        this.personal = personal;
        this.aluno = aluno;
    }

    @PrePersist
    public void preencherCriadoEm() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Usuario getPersonal() {
        return personal;
    }

    public Usuario getAluno() {
        return aluno;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
