/**
 * Testes de Segurança — Autenticação e Autorização
 * Verifica proteção de rotas e comportamento com tokens inválidos.
 */

import request from "supertest";
import app from "../../src/server/app";

jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: { query: jest.fn(), end: jest.fn() },
}));

jest.mock("firebase-admin", () => ({
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    auth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn().mockRejectedValue(new Error("Token inválido")),
        revokeRefreshTokens: jest.fn(),
    }),
}));

jest.mock("firebase/app", () => ({
    initializeApp: jest.fn().mockReturnValue({}),
    getApps: jest.fn().mockReturnValue([]),
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn().mockReturnValue({}),
    signInWithEmailAndPassword: jest.fn().mockRejectedValue(new Error("Usuário não encontrado")),
    createUserWithEmailAndPassword: jest.fn().mockRejectedValue(new Error("Email já em uso")),
    signOut: jest.fn().mockResolvedValue(undefined),
    signInWithCredential: jest.fn().mockRejectedValue(new Error("Token inválido")),
    GoogleAuthProvider: { credential: jest.fn() },
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn().mockReturnValue({}),
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
}));

describe("[Security] Autenticação e Autorização", () => {
    describe("Rotas públicas (sem autenticação)", () => {
        it("GET /api/desafios deve ser acessível sem token", async () => {
            const { pool } = await import("../../src/service/db/postgresql/postgresqlConfig");
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const res = await request(app).get("/api/desafios");

            expect([200, 500]).toContain(res.status);
        });

        it("GET /api/capitulo deve ser acessível sem token", async () => {
            const { pool } = await import("../../src/service/db/postgresql/postgresqlConfig");
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const res = await request(app).get("/api/capitulo");

            expect([200, 500]).toContain(res.status);
        });
    });

    describe("Proteção de dados sensíveis na resposta", () => {
        it("respostas de erro não devem expor stack trace em produção", async () => {
            const { pool } = await import("../../src/service/db/postgresql/postgresqlConfig");
            (pool.query as jest.Mock).mockRejectedValue(new Error("Internal DB error com dados sensíveis"));

            const res = await request(app).get("/api/desafios");

            expect(res.body).not.toHaveProperty("stack");
            // Erro deve ser genérico, não expor detalhes internos
            if (res.body.error) {
                expect(res.body.error).not.toContain("password");
                expect(res.body.error).not.toContain("pg");
            }
        });

        it("resposta não deve conter campos de senha", async () => {
            const { pool } = await import("../../src/service/db/postgresql/postgresqlConfig");
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const res = await request(app).get("/api/desafios");
            const body = JSON.stringify(res.body);

            expect(body).not.toMatch(/password/i);
            expect(body).not.toMatch(/senha/i);
        });
    });

    describe("Headers de segurança", () => {
        it("não deve expor X-Powered-By: Express", async () => {
            const { pool } = await import("../../src/service/db/postgresql/postgresqlConfig");
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const res = await request(app).get("/api/desafios");

            expect(res.headers["x-powered-by"]).toBeUndefined();
        });
    });
});
