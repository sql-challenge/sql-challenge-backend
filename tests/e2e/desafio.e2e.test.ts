/**
 * Testes E2E — /api/desafios
 *
 * Requerem o servidor rodando com banco PostgreSQL conectado.
 * Sobem o app Express diretamente via supertest (sem servidor separado).
 */

import request from "supertest";
import app from "../../src/server/app";

// Mock do pool para não conectar em banco real durante CI
jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: {
        query: jest.fn(),
        end: jest.fn(),
    },
}));

import { pool } from "../../src/service/db/postgresql/postgresqlConfig";
const mockPool = pool as jest.Mocked<typeof pool>;

describe("[E2E] GET /api/desafios", () => {
    beforeEach(() => jest.clearAllMocks());

    it("deve retornar 200 com lista de desafios", async () => {
        (mockPool.query as jest.Mock).mockResolvedValue({
            rows: [{
                id: 1,
                titulo: "Mistério do Mundo Mágico",
                descricao: "Um investigador é convocado.",
                tempo_estimado: "5 a 10 horas",
                taxa_conclusao: 0,
                criado_em: "2026-03-22",
                atualizado_em: "2026-03-22",
            }],
        });

        const res = await request(app).get("/api/desafios");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].titulo).toBe("Mistério do Mundo Mágico");
    });

    it("deve retornar 200 para /api/desafios/:id existente", async () => {
        (mockPool.query as jest.Mock).mockResolvedValue({
            rows: [{
                id: 1,
                titulo: "Mistério do Mundo Mágico",
                descricao: "Um investigador é convocado.",
                tempo_estimado: "5 a 10 horas",
                taxa_conclusao: 0,
                criado_em: "2026-03-22",
                atualizado_em: "2026-03-22",
            }],
        });

        const res = await request(app).get("/api/desafios/1");

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
    });

    it("deve retornar 500 para /api/desafios/:id inexistente", async () => {
        (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

        const res = await request(app).get("/api/desafios/999");

        expect(res.status).toBe(500);
    });
});
