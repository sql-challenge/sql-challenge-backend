import { User } from "../domain/user.entity"
import { IUserPort } from "../ports/user.port";

export class UserUseCase {
	constructor(private userPort: IUserPort) {}

	// GET
	async getAll(): Promise<User[]> {
		return await this.userPort.getAll();
	}
	async getUserByUID(uid: string): Promise<User> {
		return await this.userPort.getUserByUID(uid);
	}
	async getUsersByName(name: string): Promise<User[]> {
		return await this.userPort.getUsersByName(name);
	}
	async getUserByEmail(email: string): Promise<User> {
		// validate email
		return await this.userPort.getUserByEmail(email);
	}

	// POST
	async addUser(user: User): Promise<User> {
		return await this.userPort.addUser(user);
	}

	// PUT
	async updateUser(user: User): Promise<User> {
		return await this.userPort.updateUser(user);
	}

	// DELETE
	async deleteUser(uid: string): Promise<void> {
		return this.userPort.deleteUser(uid);
	}
}
