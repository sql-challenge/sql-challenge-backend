import { DicaUseCase } from "../../../src/service/core/useCases/dica.useCase";
import { IDicaPort } from "../../../src/service/core/ports/dica.port";
import { makeDica } from "../../helpers/factories";

const mockPort: jest.Mocked<IDicaPort> = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByCapituloId: jest.fn(),
};

const useCase = new DicaUseCase(mockPort);

describe("DicaUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar todas as dicas", async () => {
            const dicas = [
                makeDica({ id: 1, penalidadeXp: 10 }),
                makeDica({ id: 2, penalidadeXp: 25 }),
                makeDica({ id: 3, penalidadeXp: 50 }),
            ];
            mockPort.getAll.mockResolvedValue(dicas);

            const result = await useCase.getAll();

            expect(result).toHaveLength(3);
            expect(result[2].penalidadeXp).toBe(50);
        });
    });

    describe("getById", () => {
        it("deve retornar dica pelo ID", async () => {
            const dica = makeDica({ id: 2, ordem: 2, penalidadeXp: 25 });
            mockPort.getById.mockResolvedValue(dica);

            const result = await useCase.getById(2);

            expect(mockPort.getById).toHaveBeenCalledWith(2);
            expect(result.penalidadeXp).toBe(25);
        });

        it("deve propagar erro quando dica não é encontrada", async () => {
            mockPort.getById.mockRejectedValue(new Error("Dica não encontrada."));

            await expect(useCase.getById(999)).rejects.toThrow("Dica não encontrada.");
        });
    });

    describe("getByCapituloId", () => {
        it("deve retornar dicas de um capítulo ordenadas por ordem", async () => {
            const dicas = [
                makeDica({ id: 1, idCapitulo: 2, ordem: 1, penalidadeXp: 10 }),
                makeDica({ id: 2, idCapitulo: 2, ordem: 2, penalidadeXp: 25 }),
                makeDica({ id: 3, idCapitulo: 2, ordem: 3, penalidadeXp: 50 }),
            ];
            mockPort.getByCapituloId.mockResolvedValue(dicas);

            const result = await useCase.getByCapituloId(2);

            expect(mockPort.getByCapituloId).toHaveBeenCalledWith(2);
            expect(result).toHaveLength(3);
            expect(result[0].penalidadeXp).toBeLessThan(result[2].penalidadeXp);
        });

        it("deve retornar array vazio quando capítulo não tem dicas", async () => {
            mockPort.getByCapituloId.mockResolvedValue([]);

            const result = await useCase.getByCapituloId(99);

            expect(result).toEqual([]);
        });
    });
});
