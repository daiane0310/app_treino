package com.apptreino.repository;

import com.apptreino.model.TreinoExercicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TreinoExercicioRepository extends JpaRepository<TreinoExercicio, Long> {

    List<TreinoExercicio> findAllByTreinoIdAndAtivoTrueOrderByOrdemAsc(Long treinoId);

    boolean existsByTreinoIdAndOrdemAndAtivoTrue(Long treinoId, Integer ordem);

    boolean existsByTreinoIdAndExercicioIdAndAtivoTrue(Long treinoId, Long exercicioId);

    Optional<TreinoExercicio> findByIdAndTreinoId(Long id, Long treinoId);

    Optional<TreinoExercicio> findByIdAndTreinoIdAndAtivoTrue(Long id, Long treinoId);

    boolean existsByTreinoIdAndOrdemAndAtivoTrueAndIdNot(
            Long treinoId,
            Integer ordem,
            Long id
    );
}
