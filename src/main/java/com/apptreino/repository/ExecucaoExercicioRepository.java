package com.apptreino.repository;

import com.apptreino.model.ExecucaoExercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExecucaoExercicioRepository extends JpaRepository<ExecucaoExercicio, Long> {

    Optional<ExecucaoExercicio> findByIdAndExecucaoTreinoId(
            Long id,
            Long execucaoTreinoId
    );

    @Modifying
    @Query("""
            update ExecucaoExercicio e
            set e.versaoResultados = e.versaoResultados + 1
            where e.id = :id and e.versaoResultados = :versaoEsperada
            """)
    int avancarVersaoResultados(@Param("id") Long id, @Param("versaoEsperada") long versaoEsperada);

    List<ExecucaoExercicio> findAllByExecucaoTreinoIdOrderByOrdemPlanejadaAsc(
            Long execucaoTreinoId
    );
}
