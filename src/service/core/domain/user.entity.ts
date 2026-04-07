// Tipos auxiliares
export type Friend = {
	uid: string;
	status: "pending" | "accepted";
	username: string;
	nick: string;
	rankingPosition: number;
	xp: number;
};

export type ChallengeProgress = {
	nameChallange: string;
	capFinish: number;
	xpObtido: number;
};

export interface IUser {
	uid: string;
	username: string;
	xp: number;
	nick: string;
	email: string;
	createdAt: Date;
	lastLogin: Date;
}

export interface IUserView extends IUser{
	rankingPosition: number;
	friends: Friend[];
	challenge_progress: ChallengeProgress[];
	imagePerfil: string | null;
	awardedAchievements?: string[];
}

// export interface IUserSignUpView extends IUser {
// 	password: string;
// }

export type IUserSignUp = Omit<IUser, "uid" | "createdAt" | "lastLogin" | "xp"> & { password: string; }



// Entidade User
// export class User implements IUserView{
// 	private uid: string;
// 	private username: string;
// 	// private nick: string;
// 	private email: string;	
// 	// private password?: string;
// 	private imagePerfil: string;
// 	private createdAt: Date;
// 	private lastLogin: Date;
// 	private xp: number;
// 	//
// 	private rankingPosition: number;
// 	private friends: Friend[];
// 	private challenge_progress: ChallengeProgress[];

// 	constructor(uid: string, username: string, nick: string, email: string, imagePerfil: string, createdAt: Date, lastLogin: Date, rankingPosition: number, xp: number, friends: Friend[], challenge_progress: ChallengeProgress[], password?: string) {
// 		if (uid == "") throw new Error("User UID is required!");

// 		this.uid = uid;
// 		this.username = username;
// 		this.nick = nick;
// 		this.email = email;
// 		this.imagePerfil = imagePerfil;
// 		this.createdAt = createdAt;
// 		this.lastLogin = lastLogin;
// 		this.rankingPosition = rankingPosition;
// 		this.xp = xp;
// 		this.password = password;
// 		this.friends = friends;
// 		this.challenge_progress = challenge_progress;
// 	}
// }
