ALTER TABLE execucoes_exercicio
    ADD COLUMN versao_resultados BIGINT NOT NULL DEFAULT 0
    CHECK (versao_resultados >= 0);
