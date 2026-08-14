package com.apptreino.repository;

import com.apptreino.model.ExecucaoTreino;
import com.apptreino.model.StatusExecucaoTreino;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecucaoTreinoRepository extends JpaRepository<ExecucaoTreino, Long> {

    boolean existsByTreinoIdAndAlunoIdAndStatus(
            Long treinoId,
            Long alunoId,
            StatusExecucaoTreino status
    );

    List<ExecucaoTreino> findAllByAlunoIdOrderByIniciadoEmDesc(Long alunoId);
}
