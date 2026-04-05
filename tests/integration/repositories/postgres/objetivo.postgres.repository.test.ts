/**
 * Testes de integração — ObjetivoPostgresRepository
 * Requer banco PostgreSQL ativo com dados do DML.
 */

import { ObjetivoPostgresRepository } from "../../../../src/service/adapters/repository/postgres/gestao/objetivo.postgres.repository";

const repo = new ObjetivoPostgresRepository();

describe("[Integration] ObjetivoPostgresRepository", () => {

    describe("getAll", () => {
        it("deve retornar os 26 objetivos do Mundo Mágico", async () => {
            const result = await repo.getAll();

            expect(result.length).toBe(26);
        });

        it("deve retornar objetivos com campo nivel preenchido", async () => {
            const result = await repo.getAll();

            result.forEach(o => {
                expect(o.nivel).toBeDefined();
                expect(typeof o.nivel).toBe("number");
            });
        });
    });

    describe("getById", () => {
        it("deve retornar objetivo com nivel correto", async () => {
            const result = await repo.getById(6); // objetivo 6 do capítulo 1, nivel 2

            expect(result.id).toBe(6);
            expect(result.nivel).toBe(2);
        });

        it("deve lançar erro para ID inexistente", async () => {
            await expect(repo.getById(999)).rejects.toThrow("Objetivo não encontrado.");
        });
    });

    describe("getByCapituloId", () => {
        it("deve retornar 6 objetivos do capítulo 1 ordenados por ordem", async () => {
            const result = await repo.getByCapituloId(1);

            expect(result.length).toBe(6);
            expect(result[0].ordem).toBe(1);
            expect(result[5].ordem).toBe(6);
        });

        it("deve retornar objetivos com diferentes níveis no capítulo 1", async () => {
            const result = await repo.getByCapituloId(1);
            const niveis = result.map(o => o.nivel);

            expect(niveis).toContain(0);
            expect(niveis).toContain(1);
            expect(niveis).toContain(2);
        });

        it("deve retornar array vazio para capítulo sem objetivos", async () => {
            const result = await repo.getByCapituloId(999);

            expect(result).toEqual([]);
        });
    });
});
