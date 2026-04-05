/**
 * Testes de integração — Capitulo Controller
 * Testa o controller junto com os use cases usando factory mocks dos repositories.
 */

import { Request, Response } from "express";
import { makeCapitulo, makeObjetivo, makeDica, makeConsulta } from "../../helpers/factories";

// Factory mocks — expõem as funções diretamente para controlar a instância
// singleton já criada no nível de módulo do controller.
const mockCapGetAll = jest.fn();
const mockCapGetById = jest.fn();
const mockCapGetByDesafioId = jest.fn();
const mockObjGetByCapituloId = jest.fn();
const mockDicaGetByCapituloId = jest.fn();
const mockConsultaGetByCapituloId = jest.fn();

jest.mock("../../../src/service/adapters/repository/postgres/gestao/capitulo.postgres.repository", () => ({
    CapituloPostgresRepository: jest.fn().mockImplementation(() => ({
        getAll: mockCapGetAll,
        getById: mockCapGetById,
        getByDesafioId: mockCapGetByDesafioId,
    })),
}));

jest.mock("../../../src/service/adapters/repository/postgres/gestao/objetivo.postgres.repository", () => ({
    ObjetivoPostgresRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn(),
        getById: jest.fn(),
        getByCapituloId: mockObjGetByCapituloId,
    })),
}));

jest.mock("../../../src/service/adapters/repository/postgres/gestao/dica.postgres.repository", () => ({
    DicaPostgresRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn(),
        getById: jest.fn(),
        getByCapituloId: mockDicaGetByCapituloId,
    })),
}));

jest.mock("../../../src/service/adapters/repository/postgres/gestao/consulta.postgres.repository", () => ({
    ConsultaPostgresRepository: jest.fn().mockImplementation(() => ({
        getAll: jest.fn(),
        getById: jest.fn(),
        getByCapituloId: mockConsultaGetByCapituloId,
    })),
}));

import * as capituloController from "../../../src/service/adapters/controller/capitulo.controller";

const mockReq = (params = {}, body = {}) => ({ params, body } as unknown as Request);
const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("[Integration] CapituloController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapGetAll.mockResolvedValue([makeCapitulo()]);
        mockCapGetById.mockResolvedValue(makeCapitulo());
        mockCapGetByDesafioId.mockResolvedValue([makeCapitulo()]);
        mockObjGetByCapituloId.mockResolvedValue([makeObjetivo()]);
        mockDicaGetByCapituloId.mockResolvedValue([makeDica()]);
        mockConsultaGetByCapituloId.mockResolvedValue([makeConsulta()]);
    });

    describe("getAll", () => {
        it("deve responder 200 com lista de capítulos", async () => {
            const req = mockReq();
            const res = mockRes();

            await capituloController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe("getById", () => {
        it("deve responder 200 com capítulo pelo ID", async () => {
            const req = mockReq({ id: "1" });
            const res = mockRes();

            await capituloController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("getCapituloViewById", () => {
        it("deve responder 200 com capitulo + objetivos + dicas + consulta", async () => {
            const req = mockReq({ id: "1" });
            const res = mockRes();

            await capituloController.getCapituloViewById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
            expect(jsonArg.data).toHaveProperty("capitulo");
            expect(jsonArg.data).toHaveProperty("objetivos");
            expect(jsonArg.data).toHaveProperty("dicas");
            expect(jsonArg.data).toHaveProperty("consultaSolucao");
        });

        it("deve responder 400 para ID não numérico", async () => {
            const req = mockReq({ id: "abc" });
            const res = mockRes();

            await capituloController.getCapituloViewById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("deve responder 404 quando não há consulta para o capítulo", async () => {
            mockConsultaGetByCapituloId.mockResolvedValueOnce([]);
            const req = mockReq({ id: "1" });
            const res = mockRes();

            await capituloController.getCapituloViewById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
