import { IUserSignUp, IUserView } from "../domain/user.entity"
import { IChapterProgressDto, IUserPort } from "../ports/user.port";

export class UserUseCase {
	constructor(private userPort: IUserPort) {}

	// GET
	async getAll(): Promise<IUserView[]> {
		return await this.userPort.getAll();
	}
	async getTopByXP(limit?: number): Promise<IUserView[]> {
		return await this.userPort.getTopByXP(limit);
	}
	async getUserByUID(uid: string): Promise<IUserView> {
		return await this.userPort.getUserByUID(uid);
	}
	async getUsersByName(name: string): Promise<IUserView[]> {
		return await this.userPort.getUsersByName(name);
	}
	async getUserByEmail(email: string): Promise<IUserView> {
		// validate email
		return await this.userPort.getUserByEmail(email);
	}

	// POST
	async addUser(user: IUserSignUp): Promise<IUserView> {
		return await this.userPort.addUser(user);
	}
	// async addUserbyGoogle(idToken: string): Promise<IUserView> {
	// 	return await this.userPort.addUserbyGoogle(idToken);
	// }
	async loginWithEmail(email: string, password: string): Promise<IUserView> {
		return await this.userPort.loginWithEmail(email, password);
	}
	async loginWithGoogle(idToken: string): Promise<IUserView> {
		return await this.userPort.loginWithGoogle(idToken);
	}
	async loginWithOAuth(idToken: string): Promise<IUserView> {
		return await this.userPort.loginWithOAuth(idToken);
	}
	async logout(uid: string): Promise<void> {
		return await this.userPort.logout(uid);
	}
	async resetPassword(uid: string, new_pasw: string): Promise<void> {
		return await this.userPort.resetPassword(uid, new_pasw);
	}

	// PUT
	async updateUser(user: Partial<IUserView>): Promise<boolean> {
		return await this.userPort.updateUser(user);
	}

	async saveChapterProgress(uid: string, dto: IChapterProgressDto): Promise<void> {
		return this.userPort.saveChapterProgress(uid, dto);
	}

	// DELETE
	async deleteUser(uid: string): Promise<void> {
		return this.userPort.deleteUser(uid);
	}
}
