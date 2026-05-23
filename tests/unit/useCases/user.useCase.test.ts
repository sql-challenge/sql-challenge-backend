import { UserUseCase } from "../../../src/service/core/useCases/user.useCase";
import { IUserPort } from "../../../src/service/core/ports/user.port";
import { makeUserView } from "../../helpers/factories";

const mockPort: jest.Mocked<IUserPort> = {
    getAll: jest.fn(),
    getTopByXP: jest.fn(),
    getUserByUID: jest.fn(),
    getUsersByName: jest.fn(),
    getUserByEmail: jest.fn(),
    loginWithOAuth: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    updateUser: jest.fn(),
    saveChapterProgress: jest.fn(),
    addFriend: jest.fn(),
    acceptFriend: jest.fn(),
    removeFriend: jest.fn(),
    getFriends: jest.fn(),
    getFriendsRanking: jest.fn(),
    awardAchievement: jest.fn(),
    deleteUser: jest.fn(),
};

const useCase = new UserUseCase(mockPort);

describe("UserUseCase", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getAll", () => {
        it("deve retornar lista de usuários", async () => {
            const users = [makeUserView(), makeUserView({ uid: "uid-456", username: "outro_user" })];
            mockPort.getAll.mockResolvedValue(users);

            const result = await useCase.getAll();

            expect(result).toHaveLength(2);
        });
    });

    describe("getUserByUID", () => {
        it("deve retornar usuário pelo UID", async () => {
            const user = makeUserView({ uid: "uid-test-123" });
            mockPort.getUserByUID.mockResolvedValue(user);

            const result = await useCase.getUserByUID("uid-test-123");

            expect(mockPort.getUserByUID).toHaveBeenCalledWith("uid-test-123");
            expect(result.uid).toBe("uid-test-123");
        });
    });

    describe("getUsersByName", () => {
        it("deve retornar usuários pelo nome", async () => {
            const users = [makeUserView({ username: "rodrigo_macedo" })];
            mockPort.getUsersByName.mockResolvedValue(users);

            const result = await useCase.getUsersByName("rodrigo");

            expect(mockPort.getUsersByName).toHaveBeenCalledWith("rodrigo");
            expect(result[0].username).toBe("rodrigo_macedo");
        });
    });

    describe("getUserByEmail", () => {
        it("deve retornar usuário pelo email", async () => {
            const user = makeUserView({ email: "teste@email.com" });
            mockPort.getUserByEmail.mockResolvedValue(user);

            const result = await useCase.getUserByEmail("teste@email.com");

            expect(result.email).toBe("teste@email.com");
        });
    });

    describe("updateUser", () => {
        it("deve atualizar dados do usuário", async () => {
            const updated = makeUserView({ uid: "uid-test-123", nick: "NovoNick" });
            mockPort.updateUser.mockResolvedValue(updated);

            const result = await useCase.updateUser({ uid: "uid-test-123", nick: "NovoNick" });

            expect(result.nick).toBe("NovoNick");
        });
    });

    describe("deleteUser", () => {
        it("deve deletar usuário pelo UID", async () => {
            mockPort.deleteUser.mockReturnValue(undefined as never);

            await expect(useCase.deleteUser("uid-test-123")).resolves.not.toThrow();
            expect(mockPort.deleteUser).toHaveBeenCalledWith("uid-test-123");
        });
    });

    describe("logout", () => {
        it("deve realizar logout do usuário", async () => {
            mockPort.logout.mockResolvedValue(undefined as never);

            await expect(useCase.logout("uid-test-123")).resolves.not.toThrow();
        });
    });

    describe("resetPassword", () => {
        it("deve resetar a senha do usuário", async () => {
            mockPort.resetPassword.mockResolvedValue(undefined);

            await expect(useCase.resetPassword("uid-test-123", "NovaSenha@456")).resolves.not.toThrow();
            expect(mockPort.resetPassword).toHaveBeenCalledWith("uid-test-123", "NovaSenha@456");
        });
    });
});
