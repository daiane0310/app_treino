package com.apptreino.repository;

import com.apptreino.model.VinculoPersonalAluno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VinculoPersonalAlunoRepository extends JpaRepository<VinculoPersonalAluno, Long> {

    boolean existsByAlunoId(Long alunoId);

    Optional<VinculoPersonalAluno> findByAlunoId(Long alunoId);

    List<VinculoPersonalAluno> findAllByPersonalId(Long personalId);

    boolean existsByPersonalIdAndAlunoId(Long personalId, Long alunoId);
}
