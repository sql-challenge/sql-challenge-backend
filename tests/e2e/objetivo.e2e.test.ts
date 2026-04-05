/**
 * Testes E2E — /api/objetivos
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

const objetivoRow = { id: 1, id_capitulo: 1, descricao: "Identificar regiões", ordem: 1, nivel: 0 };

describe("[E2E] GET /api/objetivos", () => {
    beforeEach(() => jest.clearAllMocks());

    it("deve retornar 200 com lista de objetivos contendo campo nivel", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [objetivoRow] });

        const res = await request(app).get("/api/objetivos");

        expect(res.status).toBe(200);
        expect(res.body[0].nivel).toBeDefined();
    });

    it("deve retornar 200 para /api/objetivos/:id", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [objetivoRow] });

        const res = await request(app).get("/api/objetivos/1");

        expect(res.status).toBe(200);
        expect(res.body.nivel).toBe(0);
    });

    it("deve retornar 500 para /api/objetivos/:id inexistente", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

        const res = await request(app).get("/api/objetivos/999");

        expect(res.status).toBe(500);
    });
});
