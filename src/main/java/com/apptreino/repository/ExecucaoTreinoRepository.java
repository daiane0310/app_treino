package com.apptreino.repository;

import com.apptreino.model.ExecucaoTreino;
import com.apptreino.model.StatusExecucaoTreino;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExecucaoTreinoRepository extends JpaRepository<ExecucaoTreino, Long> {

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("select e from ExecucaoTreino e where e.id = :id")
    Optional<ExecucaoTreino> findByIdForResultSave(@Param("id") Long id);

    boolean existsByTreinoIdAndAlunoIdAndStatus(
            Long treinoId,
            Long alunoId,
            StatusExecucaoTreino status
    );

    List<ExecucaoTreino> findAllByAlunoIdOrderByIniciadoEmDesc(Long alunoId);
}
