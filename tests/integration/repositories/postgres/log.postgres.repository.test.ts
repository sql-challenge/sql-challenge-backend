/**
 * Testes de integração — LogPostgresRepository
 * Requer banco PostgreSQL ativo.
 * Os logs são gerados automaticamente pelos triggers de auditoria.
 */

import { LogPostgresRepository } from "../../../../src/service/adapters/repository/postgres/gestao/log.postgres.repository";

const repo = new LogPostgresRepository();

describe("[Integration] LogPostgresRepository", () => {

    describe("getAll", () => {
        it("deve retornar registros de log", async () => {
            const result = await repo.getAll();

            expect(Array.isArray(result)).toBe(true);
        });

        it("deve retornar logs com campos obrigatórios", async () => {
            const result = await repo.getAll();

            if (result.length > 0) {
                const log = result[0];
                expect(log.id).toBeDefined();
                expect(log.tableName).toBeDefined();
                expect(log.operation).toBeDefined();
                expect(log.changedBy).toBeDefined();
                expect(log.changedAt).toBeDefined();
            }
        });

        it("deve retornar logs com operação válida (INSERT/UPDATE/DELETE)", async () => {
            const result = await repo.getAll();
            const validOperations = ["INSERT", "UPDATE", "DELETE"];

            result.forEach(l => {
                expect(validOperations).toContain(l.operation);
            });
        });
    });

    describe("getById", () => {
        it("deve lançar erro para ID inexistente", async () => {
            await expect(repo.getById(999999)).rejects.toThrow("Log não encontrado.");
        });

        it("deve retornar log existente pelo ID", async () => {
            const all = await repo.getAll();

            if (all.length > 0) {
                const log = await repo.getById(all[0].id);
                expect(log.id).toBe(all[0].id);
            }
        });
    });
});
