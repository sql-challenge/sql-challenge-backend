import { IUserView, IUser, IUserSignUp } from "../domain/user.entity"

export interface IUserPort {
	// GET
	getAll(): Promise<IUserView[]>
	getTopByXP(limit?: number): Promise<IUserView[]>
	getUserByUID(uid: string): Promise<IUserView>
	getUsersByName(name: string): Promise<IUserView[]>
	getUserByEmail(email: string): Promise<IUserView>

	// POST
	addUser(user: IUserSignUp): Promise<IUserView>
	// addUserbyGoogle(idToken: string): Promise<User>

	loginWithEmail(email: string, password: string) : Promise<IUserView>
	loginWithGoogle(idToken: string) : Promise<IUserView>
	loginWithOAuth(idToken: string) : Promise<IUserView>

	logout(uid: string) : void

	resetPassword(uid: string, new_psw: string): Promise<void>

	// PUT
	updateUser(user: Partial<IUserView>): Promise<boolean>

	// challenge_progress subcollection
	saveChapterProgress(uid: string, dto: IChapterProgressDto): Promise<void>

	// Friends
	addFriend(uid: string, targetUid: string): Promise<void>
	acceptFriend(uid: string, targetUid: string): Promise<void>
	removeFriend(uid: string, targetUid: string): Promise<void>
	getFriends(uid: string): Promise<import("../domain/user.entity").Friend[]>
	getFriendsRanking(uid: string): Promise<import("../domain/user.entity").IUserView[]>

	// Achievements
	awardAchievement(uid: string, achievementId: string, xpBonus: number): Promise<boolean>

	// DELETE
	deleteUser(uid: string): void

}

export interface IChapterProgressDto {
	desafioId: string
	nameChallenge: string
	capFinish: number
	xpObtido: number
	tempoSegundos: number
}