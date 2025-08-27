import { User } from "../domain/user.entity"

export interface IUserPort {
	// GET
	getAll(): Promise<User[]>
	getUserByUID(uid: string): Promise<User>
	getUsersByName(name: string): Promise<User[]>
	getUserByEmail(email: string): Promise<User>

	// POST
	addUser(user: User): Promise<User>

	// PUT
	updateUser(user: User): Promise<User>

	// DELETE
	deleteUser(uid: string): void

}