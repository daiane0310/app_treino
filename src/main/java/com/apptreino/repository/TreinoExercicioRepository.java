package com.apptreino.repository;

import com.apptreino.model.TreinoExercicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TreinoExercicioRepository extends JpaRepository<TreinoExercicio, Long> {

    List<TreinoExercicio> findAllByTreinoIdOrderByOrdemAsc(Long treinoId);

    boolean existsByTreinoIdAndOrdem(Long treinoId, Integer ordem);

    boolean existsByTreinoIdAndExercicioId(Long treinoId, Long exercicioId);

    Optional<TreinoExercicio> findByIdAndTreinoId(Long id, Long treinoId);

    boolean existsByTreinoIdAndOrdemAndIdNot(
            Long treinoId,
            Integer ordem,
            Long id
    );
}
