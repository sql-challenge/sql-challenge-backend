/**
 * Testes E2E — /api/dicas
 */

import request from "supertest";
import app from "../../src/server/app";

jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: { query: jest.fn(), end: jest.fn() },
}));

import { pool } from "../../src/service/db/postgresql/postgresqlConfig";

const dicaRows = [
    { id: 1, id_capitulo: 1, ordem: 1, conteudo: "Use SELECT *", penalidade_xp: 10 },
    { id: 2, id_capitulo: 1, ordem: 2, conteudo: "Filtre com WHERE", penalidade_xp: 25 },
    { id: 3, id_capitulo: 1, ordem: 3, conteudo: "Query completa: ...", penalidade_xp: 50 },
];

describe("[E2E] GET /api/dicas", () => {
    beforeEach(() => jest.clearAllMocks());

    it("deve retornar 200 com lista de dicas", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: dicaRows });

        const res = await request(app).get("/api/dicas");

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
    });

    it("deve retornar 200 para /api/dicas/:id", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [dicaRows[0]] });

        const res = await request(app).get("/api/dicas/1");

        expect(res.status).toBe(200);
        expect(res.body.penalidadeXp).toBe(10);
    });

    it("deve retornar 200 para /api/dicas/capitulo/:idCapitulo", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: dicaRows });

        const res = await request(app).get("/api/dicas/capitulo/1");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
    });
});
