/**
 * Testes E2E — /api/visoes (se rota existir) ou via controller
 */

import request from "supertest";
import app from "../../src/server/app";

jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: { query: jest.fn(), end: jest.fn() },
}));

import { pool } from "../../src/service/db/postgresql/postgresqlConfig";

const visaoRows = [
    { id: 1, id_capitulo: 1, comando: "regioes_reinos" },
    { id: 2, id_capitulo: 1, comando: "especies_governantes" },
];

describe("[E2E] Visao endpoints", () => {
    beforeEach(() => jest.clearAllMocks());

    it("deve retornar visões com campos id, idCapitulo e comando", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: visaoRows });

        // Testa via controller diretamente quando não há rota HTTP dedicada
        const { VisaoPostgresRepository } = await import("../../src/service/adapters/repository/postgres/gestao/visao.postgres.repository");
        const repo = new VisaoPostgresRepository();
        const result = await repo.getAll();

        expect(result.length).toBe(2);
        expect(result[0].comando).toBe("regioes_reinos");
        expect(result[1].idCapitulo).toBe(1);
    });

    it("deve retornar visão pelo ID", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [visaoRows[0]] });

        const { VisaoPostgresRepository } = await import("../../src/service/adapters/repository/postgres/gestao/visao.postgres.repository");
        const repo = new VisaoPostgresRepository();
        const result = await repo.getById(1);

        expect(result.id).toBe(1);
        expect(result.comando).toBe("regioes_reinos");
    });

    it("deve lançar erro para visão inexistente", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

        const { VisaoPostgresRepository } = await import("../../src/service/adapters/repository/postgres/gestao/visao.postgres.repository");
        const repo = new VisaoPostgresRepository();

        await expect(repo.getById(999)).rejects.toThrow("Visão não encontrada!");
    });
});
