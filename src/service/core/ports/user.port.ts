import { IUserView, IUser, IUserSignUp } from "../domain/user.entity"

export interface IUserPort {
	// GET
	getAll(): Promise<IUserView[]>
	getUserByUID(uid: string): Promise<IUserView>
	getUsersByName(name: string): Promise<IUserView[]>
	getUserByEmail(email: string): Promise<IUserView>

	// POST
	addUser(user: IUserSignUp): Promise<IUserView>
	// addUserbyGoogle(idToken: string): Promise<User>

	loginWithEmail(email: string, password: string) : Promise<IUserView>
	loginWithGoogle(idToken: string) : Promise<IUserView>

	logout(uid: string) : void

	resetPassword(uid: string, new_psw: string): Promise<void>

	// PUT
	updateUser(user: Partial<IUserView>): Promise<boolean>

	// DELETE
	deleteUser(uid: string): void

}