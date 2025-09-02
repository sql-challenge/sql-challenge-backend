export class User {
	private uid: string;
	private username: string;
	private nick: string;
	private email: string;
	private password: string;
	private imagePerfil: string;
	private createdAt: Date;
	private lastLogin: Date;
	private totalScore: number;
	private xp: number;

	constructor(uid: string, username: string, nick: string, email: string, imagePerfil: string, createdAt: Date, lastLogin: Date, totalScore: number, xp: number, password: string) {
		if (uid == "") throw new Error("User UID is required!");

		this.uid = uid;
		this.username = username;
		this.nick = nick;
		this.email = email;
		this.imagePerfil = imagePerfil;
		this.createdAt = createdAt;
		this.lastLogin = lastLogin;
		this.totalScore = totalScore;
		this.xp = xp;
		this.password = password;
	}
}
