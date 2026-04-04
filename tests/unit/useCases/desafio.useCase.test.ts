import { DesafioUseCase } from "../../../src/service/core/useCases/desafio.useCase";
import { IDesafioPort } from "../../../src/service/core/ports/desafio.port";
import { makeDesafio, makeCapitulo } from "../../helpers/factories";

const mockPort: jest.Mocked<IDesafioPort> = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getWithCapitulo: jest.fn(),
};

const useCase = new DesafioUseCase(mockPort);

describe("DesafioUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar lista de desafios", async () => {
            const desafios = [makeDesafio(), makeDesafio({ id: 2, titulo: "Outro Desafio" })];
            mockPort.getAll.mockResolvedValue(desafios);

            const result = await useCase.getAll();

            expect(mockPort.getAll).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0].titulo).toBe("Mistério do Mundo Mágico");
        });

        it("deve retornar array vazio quando não há desafios", async () => {
            mockPort.getAll.mockResolvedValue([]);

            const result = await useCase.getAll();

            expect(result).toEqual([]);
        });
    });

    describe("getById", () => {
        it("deve retornar o desafio pelo ID", async () => {
            const desafio = makeDesafio();
            mockPort.getById.mockResolvedValue(desafio);

            const result = await useCase.getById(1);

            expect(mockPort.getById).toHaveBeenCalledWith(1);
            expect(result.id).toBe(1);
            expect(result.titulo).toBe("Mistério do Mundo Mágico");
        });

        it("deve propagar erro quando desafio não é encontrado", async () => {
            mockPort.getById.mockRejectedValue(new Error("Desafio não encontrado."));

            await expect(useCase.getById(999)).rejects.toThrow("Desafio não encontrado.");
        });
    });

    describe("getWithCapitulo", () => {
        it("deve retornar desafio com capítulo", async () => {
            const desafio = makeDesafio();
            const capitulo = makeCapitulo();
            const combined = { ...desafio, ...capitulo };
            mockPort.getWithCapitulo.mockResolvedValue(combined);

            const result = await useCase.getWithCapitulo(1, 1);

            expect(mockPort.getWithCapitulo).toHaveBeenCalledWith(1, 1);
            expect(result.id).toBe(1);
        });

        it("deve propagar erro quando combinação desafio+capítulo não existe", async () => {
            mockPort.getWithCapitulo.mockRejectedValue(new Error("Desafio com capítulo não encontrado."));

            await expect(useCase.getWithCapitulo(1, 999)).rejects.toThrow("Desafio com capítulo não encontrado.");
        });
    });
});
