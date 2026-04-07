import { UserUseCase } from "../../../src/service/core/useCases/user.useCase";
import { IUserPort } from "../../../src/service/core/ports/user.port";
import { makeUserView, makeUserSignUp } from "../../helpers/factories";

const mockPort: jest.Mocked<IUserPort> = {
    getAll: jest.fn(),
    getTopByXP: jest.fn(),
    getUserByUID: jest.fn(),
    getUsersByName: jest.fn(),
    getUserByEmail: jest.fn(),
    addUser: jest.fn(),
    loginWithEmail: jest.fn(),
    loginWithGoogle: jest.fn(),
    loginWithOAuth: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn(),
    updateUser: jest.fn(),
    saveChapterProgress: jest.fn(),
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

    describe("addUser", () => {
        it("deve cadastrar novo usuário e retornar IUserView", async () => {
            const signUp = makeUserSignUp();
            const userCreated = makeUserView();
            mockPort.addUser.mockResolvedValue(userCreated);

            const result = await useCase.addUser(signUp);

            expect(mockPort.addUser).toHaveBeenCalledWith(signUp);
            expect(result.uid).toBeDefined();
        });
    });

    describe("loginWithEmail", () => {
        it("deve autenticar via email e senha", async () => {
            const user = makeUserView();
            mockPort.loginWithEmail.mockResolvedValue(user);

            const result = await useCase.loginWithEmail("teste@email.com", "Senha@123");

            expect(mockPort.loginWithEmail).toHaveBeenCalledWith("teste@email.com", "Senha@123");
            expect(result.uid).toBeDefined();
        });

        it("deve propagar erro em credenciais inválidas", async () => {
            mockPort.loginWithEmail.mockRejectedValue(new Error("Credenciais inválidas."));

            await expect(useCase.loginWithEmail("errado@email.com", "senha_errada"))
                .rejects.toThrow("Credenciais inválidas.");
        });
    });

    describe("updateUser", () => {
        it("deve atualizar dados do usuário", async () => {
            mockPort.updateUser.mockResolvedValue(true);

            const result = await useCase.updateUser({ uid: "uid-test-123", nick: "NovoNick" });

            expect(result).toBe(true);
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
