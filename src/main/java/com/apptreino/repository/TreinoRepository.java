package com.apptreino.repository;

import com.apptreino.model.Treino;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TreinoRepository extends JpaRepository<Treino, Long> {

    List<Treino> findAllByAlunoId(Long alunoId);

    List<Treino> findAllByPersonalIdAndAlunoId(Long personalId, Long alunoId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT treino FROM Treino treino WHERE treino.id = :id")
    Optional<Treino> findByIdForUpdate(@Param("id") Long id);
}
