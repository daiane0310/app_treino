package com.apptreino.repository;

import com.apptreino.model.ExecucaoTreino;
import com.apptreino.model.StatusExecucaoTreino;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExecucaoTreinoRepository extends JpaRepository<ExecucaoTreino, Long> {

    boolean existsByTreinoIdAndAlunoIdAndStatus(
            Long treinoId,
            Long alunoId,
            StatusExecucaoTreino status
    );
}
