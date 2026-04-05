/**
 * Testes de integração — CapituloPostgresRepository
 * Requer banco PostgreSQL ativo com dados do DML.
 */

import { CapituloPostgresRepository } from "../../../../src/service/adapters/repository/postgres/gestao/capitulo.postgres.repository";
import { pool } from "../../../../src/service/db/postgresql/postgresqlConfig";

const repo = new CapituloPostgresRepository();

describe("[Integration] CapituloPostgresRepository", () => {
    afterAll(async () => {
        await pool.end();
    });

    describe("getAll", () => {
        it("deve retornar os 5 capítulos do Mundo Mágico", async () => {
            const result = await repo.getAll();

            expect(result.length).toBe(5);
        });

        it("deve retornar capítulos com xpRecompensa crescente", async () => {
            const result = await repo.getAll();
            const xps = result.map(c => c.xpRecompensa);

            expect(xps).toEqual([100, 200, 300, 400, 500]);
        });
    });

    describe("getById", () => {
        it("deve retornar o capítulo 1 com dados corretos", async () => {
            const result = await repo.getById(1);

            expect(result.id).toBe(1);
            expect(result.idDesafio).toBe(1);
            expect(result.numero).toBe(1);
            expect(result.xpRecompensa).toBe(100);
        });

        it("deve lançar erro para ID inexistente", async () => {
            await expect(repo.getById(999)).rejects.toThrow("Capítulo não encontrado.");
        });
    });

    describe("getByDesafioId", () => {
        it("deve retornar capítulos do desafio 1 ordenados por número", async () => {
            const result = await repo.getByDesafioId(1);

            expect(result.length).toBe(5);
            expect(result[0].numero).toBe(1);
            expect(result[4].numero).toBe(5);
        });

        it("deve retornar array vazio para desafio inexistente", async () => {
            const result = await repo.getByDesafioId(999);

            expect(result).toEqual([]);
        });
    });
});
