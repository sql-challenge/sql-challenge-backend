import { ObjetivoUseCase } from "../../../src/service/core/useCases/objetivo.useCase";
import { IObjetivoPort } from "../../../src/service/core/ports/objetivo.port";
import { makeObjetivo } from "../../helpers/factories";

const mockPort: jest.Mocked<IObjetivoPort> = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByCapituloId: jest.fn(),
};

const useCase = new ObjetivoUseCase(mockPort);

describe("ObjetivoUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar todos os objetivos", async () => {
            const objetivos = [
                makeObjetivo({ id: 1, ordem: 1, nivel: 0 }),
                makeObjetivo({ id: 2, ordem: 2, nivel: 1 }),
            ];
            mockPort.getAll.mockResolvedValue(objetivos);

            const result = await useCase.getAll();

            expect(result).toHaveLength(2);
            expect(result[0].nivel).toBe(0);
            expect(result[1].nivel).toBe(1);
        });
    });

    describe("getById", () => {
        it("deve retornar objetivo pelo ID com campo nivel preenchido", async () => {
            const objetivo = makeObjetivo({ id: 6, nivel: 2 });
            mockPort.getById.mockResolvedValue(objetivo);

            const result = await useCase.getById(6);

            expect(mockPort.getById).toHaveBeenCalledWith(6);
            expect(result.nivel).toBe(2);
        });

        it("deve propagar erro quando objetivo não é encontrado", async () => {
            mockPort.getById.mockRejectedValue(new Error("Objetivo não encontrado."));

            await expect(useCase.getById(999)).rejects.toThrow("Objetivo não encontrado.");
        });
    });

    describe("getByCapituloId", () => {
        it("deve retornar objetivos de um capítulo ordenados por ordem", async () => {
            const objetivos = [
                makeObjetivo({ id: 1, idCapitulo: 1, ordem: 1, nivel: 0 }),
                makeObjetivo({ id: 2, idCapitulo: 1, ordem: 2, nivel: 0 }),
                makeObjetivo({ id: 3, idCapitulo: 1, ordem: 3, nivel: 1 }),
            ];
            mockPort.getByCapituloId.mockResolvedValue(objetivos);

            const result = await useCase.getByCapituloId(1);

            expect(mockPort.getByCapituloId).toHaveBeenCalledWith(1);
            expect(result).toHaveLength(3);
            expect(result.every(o => o.idCapitulo === 1)).toBe(true);
        });

        it("deve garantir que o campo nivel está presente em todos os objetivos", async () => {
            const objetivos = [
                makeObjetivo({ id: 1, nivel: 0 }),
                makeObjetivo({ id: 2, nivel: 4 }),
            ];
            mockPort.getByCapituloId.mockResolvedValue(objetivos);

            const result = await useCase.getByCapituloId(1);

            result.forEach(o => expect(o.nivel).toBeDefined());
        });
    });
});
