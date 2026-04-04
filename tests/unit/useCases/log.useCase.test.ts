import { LogUseCase } from "../../../src/service/core/useCases/log.useCases";
import { ILogPort } from "../../../src/service/core/ports/log.port";
import { makeLog } from "../../helpers/factories";

const mockPort: jest.Mocked<ILogPort> = {
    getAll: jest.fn(),
    getById: jest.fn(),
};

const useCase = new LogUseCase(mockPort);

describe("LogUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar todos os registros de log", async () => {
            const logs = [
                makeLog({ id: 1, operation: "INSERT" }),
                makeLog({ id: 2, operation: "UPDATE" }),
                makeLog({ id: 3, operation: "DELETE" }),
            ];
            mockPort.getAll.mockResolvedValue(logs);

            const result = await useCase.getAll();

            expect(result).toHaveLength(3);
            expect(result[0].operation).toBe("INSERT");
            expect(result[2].operation).toBe("DELETE");
        });

        it("deve retornar array vazio quando não há logs", async () => {
            mockPort.getAll.mockResolvedValue([]);

            const result = await useCase.getAll();

            expect(result).toEqual([]);
        });
    });

    describe("getById", () => {
        it("deve retornar log pelo ID com todos os campos", async () => {
            const log = makeLog({
                id: 1,
                tableName: "Desafio",
                operation: "INSERT",
                oldData: null,
                newData: { id: 1, titulo: "Mistério do Mundo Mágico" },
                changedBy: "admin",
            });
            mockPort.getById.mockResolvedValue(log);

            const result = await useCase.getById(1);

            expect(mockPort.getById).toHaveBeenCalledWith(1);
            expect(result.tableName).toBe("Desafio");
            expect(result.oldData).toBeNull();
            expect(result.newData).toHaveProperty("titulo");
        });

        it("deve propagar erro quando log não é encontrado", async () => {
            mockPort.getById.mockRejectedValue(new Error("Log não encontrado."));

            await expect(useCase.getById(999)).rejects.toThrow("Log não encontrado.");
        });
    });
});
