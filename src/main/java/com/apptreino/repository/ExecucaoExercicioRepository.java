package com.apptreino.repository;

import com.apptreino.model.ExecucaoExercicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExecucaoExercicioRepository extends JpaRepository<ExecucaoExercicio, Long> {

    Optional<ExecucaoExercicio> findByIdAndExecucaoTreinoId(
            Long id,
            Long execucaoTreinoId
    );

    List<ExecucaoExercicio> findAllByExecucaoTreinoIdOrderByOrdemPlanejadaAsc(
            Long execucaoTreinoId
    );
}
