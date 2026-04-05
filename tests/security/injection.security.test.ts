/**
 * Testes de Segurança — SQL Injection e Input Validation
 * Verifica que a API não é vulnerável a injeções via parâmetros de URL.
 */

import request from "supertest";

jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: { query: jest.fn(), end: jest.fn() },
}));

jest.mock("firebase/app", () => ({
    initializeApp: jest.fn().mockReturnValue({}),
    getApps: jest.fn().mockReturnValue([]),
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn().mockReturnValue({}),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    signInWithCredential: jest.fn(),
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

import app from "../../src/server/app";

import { pool } from "../../src/service/db/postgresql/postgresqlConfig";

describe("[Security] SQL Injection e Input Validation", () => {
    beforeEach(() => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    });

    describe("Parâmetros de ID", () => {
        it("não deve aceitar SQL injection no parâmetro :id de desafios", async () => {
            const res = await request(app).get("/api/desafios/1; DROP TABLE Desafio;--");

            // Deve retornar erro (404/500), nunca executar SQL malicioso
            expect([400, 404, 500]).toContain(res.status);
        });

        it("não deve aceitar SQL injection no parâmetro :id de capítulos", async () => {
            const res = await request(app).get("/api/capitulo/1 OR 1=1");

            expect([400, 404, 500]).toContain(res.status);
        });

        it("não deve aceitar SQL injection no parâmetro :id de objetivos", async () => {
            const res = await request(app).get("/api/objetivos/' UNION SELECT * FROM Log--");

            expect([400, 404, 500]).toContain(res.status);
        });

        it("deve tratar IDs negativos sem expor erros do banco", async () => {
            const res = await request(app).get("/api/desafios/-1");

            expect(res.status).not.toBe(200);
            expect(res.body).not.toHaveProperty("stack"); // não expõe stack trace
        });

        it("deve tratar IDs extremamente grandes sem crash", async () => {
            const res = await request(app).get("/api/desafios/999999999999999999");

            expect([400, 404, 500]).toContain(res.status);
        });
    });

    describe("Repositórios usam query parametrizada", () => {
        it("deve chamar pool.query com parâmetros separados (não concatenação)", async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1 }] });

            await request(app).get("/api/desafios/1");

            const queryCall = (pool.query as jest.Mock).mock.calls[0];
            // Deve ter 2 argumentos: query string + array de params
            expect(queryCall.length).toBe(2);
            expect(Array.isArray(queryCall[1])).toBe(true);
        });
    });
});
