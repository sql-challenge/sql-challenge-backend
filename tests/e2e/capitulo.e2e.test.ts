/**
 * Testes E2E — /api/capitulo
 */

import request from "supertest";

jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: {
        query: jest.fn(),
        end: jest.fn(),
    },
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

const capituloRow = {
    id: 1,
    id_desafio: 1,
    intro_historia: "O mundo mágico vive sob sombra do preconceito.",
    xp_recompensa: 100,
    contexto_historia: "Mapeie as regiões e reinos.",
    numero: 1,
};

const objetivoRow = {
    id: 1, id_capitulo: 1, descricao: "Identificar regiões", ordem: 1, nivel: 0
};

const dicaRow = {
    id: 1, id_capitulo: 1, ordem: 1, conteudo: "Use SELECT *", penalidade_xp: 10
};

const consultaRow = {
    id: 1, id_capitulo: 1, query: "SELECT * FROM regioes_reinos;",
    colunas: ["nome_reino", "geografia"], resultado: null
};

describe("[E2E] GET /api/capitulo", () => {
    beforeEach(() => jest.clearAllMocks());

    it("deve retornar 200 com lista de capítulos", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [capituloRow] });

        const res = await request(app).get("/api/capitulo");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("deve retornar 200 para /api/capitulo/:id", async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [capituloRow] });

        const res = await request(app).get("/api/capitulo/1");

        expect(res.status).toBe(200);
        expect(res.body.numero).toBe(1);
    });

    it("deve retornar 400 para /api/capitulo/view/:id com ID não numérico", async () => {
        const res = await request(app).get("/api/capitulo/view/abc");

        expect(res.status).toBe(400);
    });

    it("deve retornar 200 para /api/capitulo/view/:id com dados completos", async () => {
        const visaoRow = { id: 1, id_capitulo: 1, comando: "magical_world.regioes_reinos" };

        (pool.query as jest.Mock)
            .mockResolvedValueOnce({ rows: [capituloRow] })       // getById (capitulo)
            .mockResolvedValueOnce({ rows: [objetivoRow] })       // getByCapituloId (objetivos)
            .mockResolvedValueOnce({ rows: [dicaRow] })           // getByCapituloId (dicas)
            .mockResolvedValueOnce({ rows: [consultaRow] })       // getByCapituloId (consultas)
            .mockResolvedValueOnce({ rows: [] })                  // execução dinâmica da consulta (resultado null)
            .mockResolvedValueOnce({ rows: [visaoRow] })          // getByCapituloId (visoes)
            .mockResolvedValueOnce({ rows: [visaoRow] })          // getById (visao p/ executeViewById)
            .mockResolvedValueOnce({ rows: [] });                 // executeView (dados da view)

        const res = await request(app).get("/api/capitulo/view/1");

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("capitulo");
        expect(res.body.data).toHaveProperty("objetivos");
        expect(res.body.data).toHaveProperty("dicas");
        expect(res.body.data).toHaveProperty("schema");
        expect(res.body.data.schema).toHaveProperty("visaoTabelas");
        expect(res.body.data.schema).toHaveProperty("visaoRelacionamentos");
    });
});
