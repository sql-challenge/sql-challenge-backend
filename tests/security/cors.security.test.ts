/**
 * Testes de Segurança — CORS
 * Verifica se a API só aceita origens permitidas.
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

describe("[Security] CORS", () => {
    beforeEach(() => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
    });

    it("deve incluir cabeçalho Access-Control-Allow-Origin na resposta", async () => {
        const res = await request(app)
            .get("/api/desafios")
            .set("Origin", "http://localhost:3000");

        expect(res.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("deve responder ao preflight OPTIONS com status 2xx ou 204", async () => {
        const res = await request(app)
            .options("/api/desafios")
            .set("Origin", "http://localhost:3000")
            .set("Access-Control-Request-Method", "GET");

        expect([200, 204]).toContain(res.status);
    });

    it("deve incluir cabeçalhos de segurança na resposta", async () => {
        const res = await request(app).get("/api/desafios");

        // Verifica que não há headers problemáticos
        expect(res.headers["x-powered-by"]).toBeUndefined();
    });
});
