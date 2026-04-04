/**
 * Testes E2E — /api/consultas
 */

import request from "supertest";
import app from "../../src/server/app";

jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: { query: jest.fn(), end: jest.fn() },
}));

import { pool } from "../../src/service/db/postgresql/postgresqlConfig";

const consultaRow = {
    id: 1,
    id_capitulo: 1,
    query: "SELECT f.familiaFeudal AS nome_reino FROM Feudo f;",
    colunas: ["nome_reino", "geografia"],
    resultado: null,
};

describe("[E2E] GET /api/consultas", () => {
    beforeEach(() => jest.clearAllMocks());

    it("deve retornar 200 com lista de consultas", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [consultaRow] });

        const res = await request(app).get("/api/consultas");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("deve retornar 200 para /api/consultas/:id", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [consultaRow] });

        const res = await request(app).get("/api/consultas/1");

        expect(res.status).toBe(200);
        expect(res.body.query).toContain("SELECT");
    });

    it("deve retornar 500 para /api/consultas/:id inexistente", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

        const res = await request(app).get("/api/consultas/999");

        expect(res.status).toBe(500);
    });
});
