package com.apptreino.repository;

import com.apptreino.model.ExecucaoSerie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecucaoSerieRepository extends JpaRepository<ExecucaoSerie, Long> {

    List<ExecucaoSerie> findAllByExecucaoExercicioIdOrderByNumeroSerieAsc(
            Long execucaoExercicioId
    );

    boolean existsByExecucaoExercicioIdAndNumeroSerie(
            Long execucaoExercicioId,
            Integer numeroSerie
    );

    void deleteAllByExecucaoExercicioId(Long execucaoExercicioId);
}
