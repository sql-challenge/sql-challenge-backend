/**
 * Testes de integração — DicaPostgresRepository
 * Requer banco PostgreSQL ativo com dados do DML.
 */

import { DicaPostgresRepository } from "../../../../src/service/adapters/repository/postgres/gestao/dica.postgres.repository";

const repo = new DicaPostgresRepository();

describe("[Integration] DicaPostgresRepository", () => {

    describe("getAll", () => {
        it("deve retornar as 15 dicas (3 por capítulo × 5 capítulos)", async () => {
            const result = await repo.getAll();

            expect(result.length).toBe(15);
        });

        it("deve retornar dicas com penalidade_xp não-negativa", async () => {
            const result = await repo.getAll();

            result.forEach(d => {
                expect(d.penalidadeXp).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe("getById", () => {
        it("deve retornar a dica 1 com penalidade 10", async () => {
            const result = await repo.getById(1);

            expect(result.id).toBe(1);
            expect(result.penalidadeXp).toBe(10);
            expect(result.ordem).toBe(1);
        });

        it("deve lançar erro para ID inexistente", async () => {
            await expect(repo.getById(999)).rejects.toThrow("Dica não encontrada.");
        });
    });

    describe("getByCapituloId", () => {
        it("deve retornar 3 dicas do capítulo 1 ordenadas por ordem", async () => {
            const result = await repo.getByCapituloId(1);

            expect(result.length).toBe(3);
            expect(result[0].ordem).toBe(1);
            expect(result[1].ordem).toBe(2);
            expect(result[2].ordem).toBe(3);
        });

        it("deve retornar dicas com penalidades crescentes (10, 25, 50)", async () => {
            const result = await repo.getByCapituloId(1);

            expect(result[0].penalidadeXp).toBe(10);
            expect(result[1].penalidadeXp).toBe(25);
            expect(result[2].penalidadeXp).toBe(50);
        });
    });
});
