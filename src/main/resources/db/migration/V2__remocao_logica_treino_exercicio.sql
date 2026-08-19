ALTER TABLE treino_exercicios
    ADD COLUMN ativo BOOLEAN;

UPDATE treino_exercicios
SET ativo = TRUE
WHERE ativo IS NULL;

ALTER TABLE treino_exercicios
    ALTER COLUMN ativo SET DEFAULT TRUE;

ALTER TABLE treino_exercicios
    ALTER COLUMN ativo SET NOT NULL;

ALTER TABLE treino_exercicios
    DROP CONSTRAINT uk_treino_exercicio_ordem;

CREATE UNIQUE INDEX uk_treino_exercicio_ordem_ativo
    ON treino_exercicios (treino_id, ordem)
    WHERE ativo = TRUE;

CREATE UNIQUE INDEX uk_treino_exercicio_exercicio_ativo
    ON treino_exercicios (treino_id, exercicio_id)
    WHERE ativo = TRUE;
