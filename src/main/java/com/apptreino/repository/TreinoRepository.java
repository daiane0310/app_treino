package com.apptreino.repository;

import com.apptreino.model.Treino;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TreinoRepository extends JpaRepository<Treino, Long> {

    List<Treino> findAllByAlunoId(Long alunoId);

    List<Treino> findAllByPersonalIdAndAlunoId(Long personalId, Long alunoId);
}
