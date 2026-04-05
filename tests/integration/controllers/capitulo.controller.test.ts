/**
 * Testes de integração — Capitulo Controller
 * Testa o controller junto com os use cases usando mocks dos repositories.
 */

import { Request, Response } from "express";
import { makeCapitulo, makeObjetivo, makeDica, makeConsulta } from "../../helpers/factories";

// Mock dos repositories antes de importar o controller
jest.mock("../../../src/service/adapters/repository/postgres/gestao/capitulo.postgres.repository");
jest.mock("../../../src/service/adapters/repository/postgres/gestao/objetivo.postgres.repository");
jest.mock("../../../src/service/adapters/repository/postgres/gestao/dica.postgres.repository");
jest.mock("../../../src/service/adapters/repository/postgres/gestao/consulta.postgres.repository");

import { CapituloPostgresRepository } from "../../../src/service/adapters/repository/postgres/gestao/capitulo.postgres.repository";
import { ObjetivoPostgresRepository } from "../../../src/service/adapters/repository/postgres/gestao/objetivo.postgres.repository";
import { DicaPostgresRepository } from "../../../src/service/adapters/repository/postgres/gestao/dica.postgres.repository";
import { ConsultaPostgresRepository } from "../../../src/service/adapters/repository/postgres/gestao/consulta.postgres.repository";

import * as capituloController from "../../../src/service/adapters/controller/capitulo.controller";

const mockCapRepo = CapituloPostgresRepository as jest.MockedClass<typeof CapituloPostgresRepository>;
const mockObjRepo = ObjetivoPostgresRepository as jest.MockedClass<typeof ObjetivoPostgresRepository>;
const mockDicaRepo = DicaPostgresRepository as jest.MockedClass<typeof DicaPostgresRepository>;
const mockConsultaRepo = ConsultaPostgresRepository as jest.MockedClass<typeof ConsultaPostgresRepository>;

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

        mockCapRepo.prototype.getAll = jest.fn().mockResolvedValue([makeCapitulo()]);
        mockCapRepo.prototype.getById = jest.fn().mockResolvedValue(makeCapitulo());
        mockCapRepo.prototype.getByDesafioId = jest.fn().mockResolvedValue([makeCapitulo()]);
        mockObjRepo.prototype.getByCapituloId = jest.fn().mockResolvedValue([makeObjetivo()]);
        mockDicaRepo.prototype.getByCapituloId = jest.fn().mockResolvedValue([makeDica()]);
        mockConsultaRepo.prototype.getByCapituloId = jest.fn().mockResolvedValue([makeConsulta()]);
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
            mockConsultaRepo.prototype.getByCapituloId = jest.fn().mockResolvedValue([]);
            const req = mockReq({ id: "1" });
            const res = mockRes();

            await capituloController.getCapituloViewById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
