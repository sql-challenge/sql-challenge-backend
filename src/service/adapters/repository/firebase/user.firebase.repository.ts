import { User } from "../../../core/domain/user.entity";
import { IUserPort } from "../../../core/ports/user.port";

export class UserFirebaseRepository implements IUserPort {

	async getAll(): Promise<User[]> {
		throw new Error("Method not implemented.");
	}
	async getUserByUID(uid: string): Promise<User> {
		throw new Error("Method not implemented.");
	}
	async getUsersByName(name: string): Promise<User[]> {
		throw new Error("Method not implemented.");
	}
	async getUserByEmail(email: string): Promise<User> {
		throw new Error("Method not implemented.");
	}

	async addUser(user: User): Promise<User> {
		throw new Error("Method not implemented.");
	}

	async updateUser(user: User): Promise<User> {
		throw new Error("Method not implemented.");
	}
	
	async deleteUser(uid: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

}