/**
 * Testes de integração — ConsultaPostgresRepository
 * Requer banco PostgreSQL ativo com dados do DML.
 */

import { ConsultaPostgresRepository } from "../../../../src/service/adapters/repository/postgres/gestao/consulta.postgres.repository";

const repo = new ConsultaPostgresRepository();

describe("[Integration] ConsultaPostgresRepository", () => {

    describe("getAll", () => {
        it("deve retornar 5 consultas (uma por capítulo)", async () => {
            const result = await repo.getAll();

            expect(result.length).toBe(5);
        });

        it("deve retornar consultas com query preenchida", async () => {
            const result = await repo.getAll();

            result.forEach(c => {
                expect(c.query).toBeDefined();
                expect(c.query.length).toBeGreaterThan(0);
            });
        });
    });

    describe("getById", () => {
        it("deve retornar a consulta 1 do capítulo 1", async () => {
            const result = await repo.getById(1);

            expect(result.id).toBe(1);
            expect(result.idCapitulo).toBe(1);
            expect(result.query).toContain("Feudo");
        });

        it("deve lançar erro para ID inexistente", async () => {
            await expect(repo.getById(999)).rejects.toThrow("Consulta não encontrada.");
        });
    });

    describe("getByCapituloId", () => {
        it("deve retornar a consulta-solução do capítulo 1", async () => {
            const result = await repo.getByCapituloId(1);

            expect(result.length).toBe(1);
            expect(result[0].colunas).toContain("nome_reino");
        });

        it("deve retornar array vazio para capítulo sem consulta", async () => {
            const result = await repo.getByCapituloId(999);

            expect(result).toEqual([]);
        });
    });
});
