import { RankingUseCase } from "../../../src/service/core/useCases/ranking.useCase";
import { IRankingPort } from "../../../src/service/core/ports/ranking.port";
import { makeRanking } from "../../helpers/factories";

const mockPort: jest.Mocked<IRankingPort> = {
    getAll: jest.fn(),
    getRankingByUsername: jest.fn(),
    getRankingByNick: jest.fn(),
    getRankingByPosition: jest.fn(),
    addRanking: jest.fn(),
    updatePositionByUsername: jest.fn(),
    updatePositionByNick: jest.fn(),
    updateImageByUsername: jest.fn(),
    updateImageByNick: jest.fn(),
    deleteRanking: jest.fn(),
};

const useCase = new RankingUseCase(mockPort);

describe("RankingUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar todo o ranking", async () => {
            mockPort.getAll.mockResolvedValue([makeRanking(), makeRanking()]);

            const result = await useCase.getAll();

            expect(result).toHaveLength(2);
        });
    });

    describe("getRankingByUsername", () => {
        it("deve retornar ranking pelo username", async () => {
            mockPort.getRankingByUsername.mockResolvedValue(makeRanking());

            const result = await useCase.getRankingByUsername("rodrigo_macedo");

            expect(mockPort.getRankingByUsername).toHaveBeenCalledWith("rodrigo_macedo");
            expect(result).toBeDefined();
        });
    });

    describe("getRankingByNick", () => {
        it("deve retornar ranking pelo nick", async () => {
            mockPort.getRankingByNick.mockResolvedValue(makeRanking());

            const result = await useCase.getRankingByNick("Macedo");

            expect(mockPort.getRankingByNick).toHaveBeenCalledWith("Macedo");
            expect(result).toBeDefined();
        });
    });

    describe("getRankingByPosition", () => {
        it("deve retornar jogador pela posição no ranking", async () => {
            mockPort.getRankingByPosition.mockResolvedValue(makeRanking());

            const result = await useCase.getRankingByPosition(1);

            expect(mockPort.getRankingByPosition).toHaveBeenCalledWith(1);
            expect(result).toBeDefined();
        });
    });

    describe("addRanking", () => {
        it("deve adicionar entrada no ranking", async () => {
            const ranking = makeRanking();
            mockPort.addRanking.mockResolvedValue(ranking);

            const result = await useCase.addRanking(ranking);

            expect(mockPort.addRanking).toHaveBeenCalledWith(ranking);
            expect(result).toBeDefined();
        });
    });

    describe("updatePositionByUsername", () => {
        it("deve atualizar posição pelo username", async () => {
            mockPort.updatePositionByUsername.mockResolvedValue(makeRanking());

            const result = await useCase.updatePositionByUsername("rodrigo_macedo", 2);

            expect(mockPort.updatePositionByUsername).toHaveBeenCalledWith("rodrigo_macedo", 2);
            expect(result).toBeDefined();
        });
    });

    describe("updatePositionByNick", () => {
        it("deve atualizar posição pelo nick", async () => {
            mockPort.updatePositionByNick.mockResolvedValue(makeRanking());

            await useCase.updatePositionByNick("Macedo", 3);

            expect(mockPort.updatePositionByNick).toHaveBeenCalledWith("Macedo", 3);
        });
    });

    describe("updateImageByUsername", () => {
        it("deve atualizar imagem pelo username", async () => {
            mockPort.updateImageByUsername.mockResolvedValue(makeRanking());

            await useCase.updateImageByUsername("rodrigo_macedo", "https://img.example.com/new.png");

            expect(mockPort.updateImageByUsername).toHaveBeenCalledWith(
                "rodrigo_macedo",
                "https://img.example.com/new.png"
            );
        });
    });

    describe("deleteRanking", () => {
        it("deve remover entrada do ranking pelo username", async () => {
            mockPort.deleteRanking.mockResolvedValue(undefined);

            await expect(useCase.deleteRanking("rodrigo_macedo")).resolves.not.toThrow();
            expect(mockPort.deleteRanking).toHaveBeenCalledWith("rodrigo_macedo");
        });
    });
});
