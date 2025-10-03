import { User } from "../domain/user.entity"

export interface IUserPort {
	// GET
	getAll(): Promise<User[]>
	getUserByUID(uid: string): Promise<User>
	getUsersByName(name: string): Promise<User[]>
	getUserByEmail(email: string): Promise<User>

	// POST
	addUser(user: Omit<User, "uid" | "createdAt" | "lastLogin">): Promise<User>
	addUserbyGoogle(idToken: string): Promise<User>

	loginWithEmail(email: string, password: string) : Promise<User>
	loginWithGoogle(idToken: string) : Promise<User>

	logout(uid: string) : void

	resetPassword(uid: string, new_psw: string): Promise<void>

	// PUT
	updateUser(user: User): Promise<User>

	// DELETE
	deleteUser(uid: string): void

}