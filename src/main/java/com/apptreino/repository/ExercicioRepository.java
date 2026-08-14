package com.apptreino.repository;

import com.apptreino.model.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {

    boolean existsByNomeIgnoreCase(String nome);
}
