import { CapituloUseCase } from "../../../src/service/core/useCases/capitulo.useCase";
import { ICapituloPort } from "../../../src/service/core/ports/capitulo.port";
import { makeCapitulo } from "../../helpers/factories";

const mockPort: jest.Mocked<ICapituloPort> = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByDesafioId: jest.fn(),
};

const useCase = new CapituloUseCase(mockPort);

describe("CapituloUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar todos os capítulos", async () => {
            const capitulos = [makeCapitulo(), makeCapitulo({ id: 2, numero: 2 })];
            mockPort.getAll.mockResolvedValue(capitulos);

            const result = await useCase.getAll();

            expect(mockPort.getAll).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
        });

        it("deve retornar array vazio quando não há capítulos", async () => {
            mockPort.getAll.mockResolvedValue([]);

            const result = await useCase.getAll();

            expect(result).toEqual([]);
        });
    });

    describe("getById", () => {
        it("deve retornar o capítulo pelo ID", async () => {
            const capitulo = makeCapitulo({ id: 3, numero: 3 });
            mockPort.getById.mockResolvedValue(capitulo);

            const result = await useCase.getById(3);

            expect(mockPort.getById).toHaveBeenCalledWith(3);
            expect(result.id).toBe(3);
            expect(result.numero).toBe(3);
        });

        it("deve propagar erro quando capítulo não é encontrado", async () => {
            mockPort.getById.mockRejectedValue(new Error("Capítulo não encontrado."));

            await expect(useCase.getById(999)).rejects.toThrow("Capítulo não encontrado.");
        });
    });

    describe("getByDesafioId", () => {
        it("deve retornar capítulos de um desafio em ordem", async () => {
            const capitulos = [
                makeCapitulo({ id: 1, numero: 1, idDesafio: 1 }),
                makeCapitulo({ id: 2, numero: 2, idDesafio: 1 }),
                makeCapitulo({ id: 3, numero: 3, idDesafio: 1 }),
            ];
            mockPort.getByDesafioId.mockResolvedValue(capitulos);

            const result = await useCase.getByDesafioId(1);

            expect(mockPort.getByDesafioId).toHaveBeenCalledWith(1);
            expect(result).toHaveLength(3);
            expect(result[0].numero).toBe(1);
            expect(result[2].numero).toBe(3);
        });

        it("deve retornar array vazio para desafio sem capítulos", async () => {
            mockPort.getByDesafioId.mockResolvedValue([]);

            const result = await useCase.getByDesafioId(99);

            expect(result).toEqual([]);
        });
    });
});
