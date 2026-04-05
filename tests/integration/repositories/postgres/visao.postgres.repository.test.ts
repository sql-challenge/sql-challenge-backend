/**
 * Testes de integração — VisaoPostgresRepository
 * Requer banco PostgreSQL ativo com dados do DML.
 */

import { VisaoPostgresRepository } from "../../../../src/service/adapters/repository/postgres/gestao/visao.postgres.repository";

const repo = new VisaoPostgresRepository();

describe("[Integration] VisaoPostgresRepository", () => {

    describe("getAll", () => {
        it("deve retornar todas as visões cadastradas", async () => {
            const result = await repo.getAll();

            expect(result.length).toBeGreaterThan(0);
        });

        it("deve retornar visões com comando preenchido", async () => {
            const result = await repo.getAll();

            result.forEach(v => {
                expect(v.comando).toBeDefined();
                expect(v.comando.length).toBeGreaterThan(0);
                expect(v.idCapitulo).toBeGreaterThan(0);
            });
        });

        it("deve conter a visão regioes_reinos do capítulo 1", async () => {
            const result = await repo.getAll();
            const visao = result.find(v => v.comando === "magical_world.regioes_reinos");

            expect(visao).toBeDefined();
            expect(visao?.idCapitulo).toBe(1);
        });
    });

    describe("getById", () => {
        it("deve retornar visão pelo ID", async () => {
            const result = await repo.getById(1);

            expect(result.id).toBe(1);
            expect(result.comando).toBe("magical_world.regioes_reinos");
        });

        it("deve lançar erro para ID inexistente", async () => {
            await expect(repo.getById(999)).rejects.toThrow("Visão não encontrada!");
        });
    });
});
