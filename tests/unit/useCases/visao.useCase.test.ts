import { VisaoUseCase } from "../../../src/service/core/useCases/visao.useCase";
import { IVisaoPort } from "../../../src/service/core/ports/visao.port";
import { makeVisao } from "../../helpers/factories";

const mockPort: jest.Mocked<IVisaoPort> = {
    getAll: jest.fn(),
    getById: jest.fn(),
};

const useCase = new VisaoUseCase(mockPort);

describe("VisaoUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar todas as visões", async () => {
            const visoes = [
                makeVisao({ id: 1, comando: "regioes_reinos" }),
                makeVisao({ id: 2, comando: "especies_governantes" }),
                makeVisao({ id: 3, comando: "senhores_das_terras" }),
            ];
            mockPort.getAll.mockResolvedValue(visoes);

            const result = await useCase.getAll();

            expect(result).toHaveLength(3);
            expect(result[0].comando).toBe("regioes_reinos");
        });

        it("deve retornar array vazio quando não há visões", async () => {
            mockPort.getAll.mockResolvedValue([]);

            const result = await useCase.getAll();

            expect(result).toEqual([]);
        });
    });

    describe("getById", () => {
        it("deve retornar visão pelo ID", async () => {
            const visao = makeVisao({ id: 6, idCapitulo: 2, comando: "ataques_raw" });
            mockPort.getById.mockResolvedValue(visao);

            const result = await useCase.getById(6);

            expect(mockPort.getById).toHaveBeenCalledWith(6);
            expect(result.comando).toBe("ataques_raw");
            expect(result.idCapitulo).toBe(2);
        });

        it("deve propagar erro quando visão não é encontrada", async () => {
            mockPort.getById.mockRejectedValue(new Error("Visão não encontrada!"));

            await expect(useCase.getById(999)).rejects.toThrow("Visão não encontrada!");
        });
    });
});
