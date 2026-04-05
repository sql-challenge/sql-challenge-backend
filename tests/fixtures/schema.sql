-- ============================================================
-- CI Test Schema
-- Extracted from ddl_structure.sql — without DROP/CREATE DATABASE.
-- Run against db_gestao_challenge before integration tests.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS magical_world;

-- Drop in FK-safe order
DROP TABLE IF EXISTS Log          CASCADE;
DROP TABLE IF EXISTS Dica         CASCADE;
DROP TABLE IF EXISTS Consulta     CASCADE;
DROP TABLE IF EXISTS Objetivo     CASCADE;
DROP TABLE IF EXISTS Visao        CASCADE;
DROP TABLE IF EXISTS Capitulo     CASCADE;
DROP TABLE IF EXISTS Desafio      CASCADE;
DROP FUNCTION IF EXISTS log_changes() CASCADE;

CREATE TABLE IF NOT EXISTS Desafio (
    id             BIGSERIAL    PRIMARY KEY,
    titulo         VARCHAR(255) NOT NULL,
    descricao      TEXT,
    tempo_estimado VARCHAR(50),
    taxa_conclusao NUMERIC(5,2) DEFAULT 0,
    criado_em      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Capitulo (
    id                BIGSERIAL PRIMARY KEY,
    id_desafio        BIGINT    NOT NULL REFERENCES Desafio(id) ON DELETE CASCADE,
    numero            INT       NOT NULL,
    intro_historia    TEXT,
    contexto_historia TEXT,
    xp_recompensa     INT       NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Objetivo (
    id          BIGSERIAL PRIMARY KEY,
    id_capitulo BIGINT    NOT NULL REFERENCES Capitulo(id) ON DELETE CASCADE,
    descricao   TEXT      NOT NULL,
    ordem       INT       NOT NULL,
    nivel       INT       NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Dica (
    id            BIGSERIAL    PRIMARY KEY,
    id_capitulo   BIGINT       NOT NULL REFERENCES Capitulo(id) ON DELETE CASCADE,
    ordem         INT          NOT NULL,
    conteudo      TEXT         NOT NULL,
    penalidade_xp INT          NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Visao (
    id          BIGSERIAL    PRIMARY KEY,
    id_capitulo BIGINT       NOT NULL REFERENCES Capitulo(id) ON DELETE CASCADE,
    comando     VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Consulta (
    id          BIGSERIAL PRIMARY KEY,
    id_capitulo BIGINT    NOT NULL REFERENCES Capitulo(id) ON DELETE CASCADE,
    query       TEXT      NOT NULL,
    colunas     JSONB,
    resultado   JSONB
);

CREATE TABLE IF NOT EXISTS Log (
    id         SERIAL       PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    operation  VARCHAR(10)  NOT NULL,
    old_data   JSONB,
    new_data   JSONB,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO Log (table_name, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, 'DELETE', to_jsonb(OLD), current_user);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO Log (table_name, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_user);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO Log (table_name, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'INSERT', to_jsonb(NEW), current_user);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'desafio_audit') THEN
        CREATE TRIGGER desafio_audit
            AFTER INSERT OR UPDATE OR DELETE ON Desafio
            FOR EACH ROW EXECUTE FUNCTION log_changes();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'capitulo_audit') THEN
        CREATE TRIGGER capitulo_audit
            AFTER INSERT OR UPDATE OR DELETE ON Capitulo
            FOR EACH ROW EXECUTE FUNCTION log_changes();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'objetivo_audit') THEN
        CREATE TRIGGER objetivo_audit
            AFTER INSERT OR UPDATE OR DELETE ON Objetivo
            FOR EACH ROW EXECUTE FUNCTION log_changes();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'dica_audit') THEN
        CREATE TRIGGER dica_audit
            AFTER INSERT OR UPDATE OR DELETE ON Dica
            FOR EACH ROW EXECUTE FUNCTION log_changes();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'visao_audit') THEN
        CREATE TRIGGER visao_audit
            AFTER INSERT OR UPDATE OR DELETE ON Visao
            FOR EACH ROW EXECUTE FUNCTION log_changes();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'consulta_audit') THEN
        CREATE TRIGGER consulta_audit
            AFTER INSERT OR UPDATE OR DELETE ON Consulta
            FOR EACH ROW EXECUTE FUNCTION log_changes();
    END IF;
END $$;
