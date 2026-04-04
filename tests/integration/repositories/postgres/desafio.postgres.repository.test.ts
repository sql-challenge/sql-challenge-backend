/**
 * Testes de integração — DesafioPostgresRepository
 *
 * Requerem banco PostgreSQL ativo com dados do DML (dml_magical_world.sql).
 * Configure as variáveis de ambiente antes de executar:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * Para rodar: npm run test:integration
 */

import { DesafioPostgresRepository } from "../../../../src/service/adapters/repository/postgres/gestao/desafio.postgres.repository";
import { pool } from "../../../../src/service/db/postgresql/postgresqlConfig";

const repo = new DesafioPostgresRepository();

describe("[Integration] DesafioPostgresRepository", () => {
    afterAll(async () => {
        await pool.end();
    });

    describe("getAll", () => {
        it("deve retornar ao menos um desafio do banco", async () => {
            const result = await repo.getAll();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it("deve retornar desafios com campos obrigatórios preenchidos", async () => {
            const result = await repo.getAll();

            result.forEach(d => {
                expect(d.id).toBeDefined();
                expect(d.titulo).toBeDefined();
                expect(typeof d.taxaConclusao).toBe("number");
            });
        });
    });

    describe("getById", () => {
        it("deve retornar o desafio 'Mistério do Mundo Mágico' (id=1)", async () => {
            const result = await repo.getById(1);

            expect(result.id).toBe(1);
            expect(result.titulo).toBe("Mistério do Mundo Mágico");
        });

        it("deve lançar erro para ID inexistente", async () => {
            await expect(repo.getById(999999)).rejects.toThrow("Desafio não encontrado.");
        });
    });

    describe("getWithCapitulo", () => {
        it("deve retornar desafio com capítulo 1", async () => {
            const result = await repo.getWithCapitulo(1, 1);

            expect(result.id).toBe(1);
            expect(result.numero).toBe(1);
            expect(result.xp_recompensa).toBe(100);
        });

        it("deve lançar erro para combinação desafio+capítulo inválida", async () => {
            await expect(repo.getWithCapitulo(1, 999)).rejects.toThrow("Desafio com capítulo não encontrado.");
        });
    });
});
