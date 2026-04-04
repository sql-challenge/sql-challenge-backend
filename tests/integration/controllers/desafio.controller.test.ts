/**
 * Testes de integração — Desafio Controller
 */

import { Request, Response } from "express";
import { makeDesafio } from "../../helpers/factories";

jest.mock("../../../src/service/adapters/repository/postgres/gestao/desafio.postgres.repository");

import { DesafioPostgresRepository } from "../../../src/service/adapters/repository/postgres/gestao/desafio.postgres.repository";
import * as desafioController from "../../../src/service/adapters/controller/desafio.controller";

const mockRepo = DesafioPostgresRepository as jest.MockedClass<typeof DesafioPostgresRepository>;

const mockReq = (params = {}) => ({ params } as unknown as Request);
const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("[Integration] DesafioController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo.prototype.getAll = jest.fn().mockResolvedValue([makeDesafio()]);
        mockRepo.prototype.getById = jest.fn().mockResolvedValue(makeDesafio());
    });

    describe("getAll", () => {
        it("deve responder 200 com lista de desafios", async () => {
            const req = mockReq();
            const res = mockRes();

            await desafioController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
        });

        it("deve responder 500 em caso de erro no repositório", async () => {
            mockRepo.prototype.getAll = jest.fn().mockRejectedValue(new Error("DB error"));
            const req = mockReq();
            const res = mockRes();

            await desafioController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getById", () => {
        it("deve responder 200 com desafio pelo ID", async () => {
            const req = mockReq({ id: "1" });
            const res = mockRes();

            await desafioController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("deve responder 500 quando desafio não é encontrado", async () => {
            mockRepo.prototype.getById = jest.fn().mockRejectedValue(new Error("Desafio não encontrado."));
            const req = mockReq({ id: "999" });
            const res = mockRes();

            await desafioController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
