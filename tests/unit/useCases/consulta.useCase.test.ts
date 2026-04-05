import { ConsultaUseCase } from "../../../src/service/core/useCases/consulta.useCase";
import { IConsultaPort } from "../../../src/service/core/ports/consulta.port";
import { makeConsulta } from "../../helpers/factories";

const mockPort: jest.Mocked<IConsultaPort> = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByCapituloId: jest.fn(),
};

const useCase = new ConsultaUseCase(mockPort);

describe("ConsultaUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar todas as consultas", async () => {
            const consultas = [makeConsulta({ id: 1 }), makeConsulta({ id: 2 })];
            mockPort.getAll.mockResolvedValue(consultas);

            const result = await useCase.getAll();

            expect(result).toHaveLength(2);
        });
    });

    describe("getById", () => {
        it("deve retornar consulta pelo ID", async () => {
            const consulta = makeConsulta({ id: 1, query: "SELECT * FROM regioes_reinos;" });
            mockPort.getById.mockResolvedValue(consulta);

            const result = await useCase.getById(1);

            expect(mockPort.getById).toHaveBeenCalledWith(1);
            expect(result.query).toContain("SELECT");
        });

        it("deve lançar erro quando consulta não é encontrada", async () => {
            mockPort.getById.mockRejectedValue(new Error("Consulta não encontrada."));

            await expect(useCase.getById(999)).rejects.toThrow("Consulta não encontrada.");
        });
    });

    describe("getByCapituloId", () => {
        it("deve retornar consultas de um capítulo", async () => {
            const consultas = [makeConsulta({ id: 1, idCapitulo: 1 })];
            mockPort.getByCapituloId.mockResolvedValue(consultas);

            const result = await useCase.getByCapituloId(1);

            expect(mockPort.getByCapituloId).toHaveBeenCalledWith(1);
            expect(result).toHaveLength(1);
            expect(result[0].colunas).toContain("nome_reino");
        });

        it("deve retornar array vazio quando capítulo não tem consulta", async () => {
            mockPort.getByCapituloId.mockResolvedValue([]);

            const result = await useCase.getByCapituloId(99);

            expect(result).toEqual([]);
        });
    });
});
