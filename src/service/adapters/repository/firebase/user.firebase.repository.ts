import { IUser, IUserSignUp, IUserView } from "../../../core/domain/user.entity";
import { IChapterProgressDto, IUserPort } from "../../../core/ports/user.port";
import { adminDb } from "../../../db/firebase/firebaseAdminConfig";
import { authUser } from "../../auth/firebase.auth";

export class UserFirebaseRepository implements IUserPort {
	private get userCollection() { return adminDb.collection("User"); }

	private mapDoc(id: string, data: FirebaseFirestore.DocumentData): IUserView {
		return {
			uid: id,
			username: data.username,
			nick: data.nick ?? "",
			email: data.email,
			imagePerfil: data.imagePerfil ?? null,
			createdAt: data.createdAt?.toDate() ?? new Date(),
			lastLogin: data.lastLogin?.toDate() ?? new Date(),
			rankingPosition: data.rankingPosition ?? 0,
			xp: data.xp ?? 0,
			friends: data.friends ?? [],
			challenge_progress: data.challenge_progress ?? [],
		};
	}

	async getAll(): Promise<IUserView[]> {
		const snapshot = await this.userCollection.get();
		return snapshot.docs.map(d => this.mapDoc(d.id, d.data()));
	}

	async getTopByXP(limit = 20): Promise<IUserView[]> {
		const snapshot = await this.userCollection.orderBy("xp", "desc").limit(limit).get();
		return snapshot.docs.map(d => this.mapDoc(d.id, d.data()));
	}

	async getUserByUID(uid: string): Promise<IUserView> {
		const snap = await this.userCollection.doc(uid).get();
		if (!snap.exists) throw new Error("User not found!");
		return this.mapDoc(snap.id, snap.data()!);
	}

	async getUsersByName(name: string): Promise<IUserView[]> {
		const snapshot = await this.userCollection.where("username", "==", name).get();
		return snapshot.docs.map(d => this.mapDoc(d.id, d.data()));
	}

	async getUserByEmail(email: string): Promise<IUserView> {
		const snapshot = await this.userCollection.where("email", "==", email).get();
		if (snapshot.empty) throw new Error("User not found!");
		const d = snapshot.docs[0];
		return this.mapDoc(d.id, d.data());
	}

	async addUser(form: IUserSignUp): Promise<IUserView> {
		const uid = await authUser.registerWithEmailAndPassword(form.email, form.password);
		const date = new Date();
		const user: IUserView = {
			uid,
			username: form.username,
			nick: form.nick,
			email: form.email,
			imagePerfil: null,
			createdAt: date,
			lastLogin: date,
			rankingPosition: 0,
			xp: 0,
			friends: [],
			challenge_progress: [],
		};
		await this.userCollection.doc(uid).set({
			username: user.username,
			nick: user.nick,
			email: user.email,
			imagePerfil: null,
			createdAt: date,
			lastLogin: date,
			rankingPosition: 0,
			xp: 0,
			friends: [],
			challenge_progress: [],
		});
		console.log("Usuário criado:", user);
		return user;
	}

	async loginWithEmail(email: string, password: string): Promise<IUserView> {
		const uid = await authUser.loginWithEmailAndPassword(email, password);
		return this.getUserByUID(uid);
	}

	/**
	 * Login/cadastro via OAuth (Google, GitHub).
	 * Verifica o ID token com Firebase Admin SDK e faz upsert do usuário no Firestore.
	 */
	async loginWithOAuth(idToken: string): Promise<IUserView> {
		const decoded = await authUser.verifyIdToken(idToken);
		const ref = this.userCollection.doc(decoded.uid);
		const snap = await ref.get();

		if (!snap.exists) {
			const date = new Date();
			const displayName = decoded.name || decoded.email?.split("@")[0] || "Detetive";
			await ref.set({
				username: displayName,
				nick: displayName,
				email: decoded.email ?? "",
				imagePerfil: decoded.picture ?? null,
				createdAt: date,
				lastLogin: date,
				rankingPosition: 0,
				xp: 0,
				friends: [],
				challenge_progress: [],
			});
		} else {
			await ref.update({ lastLogin: new Date() });
		}

		return this.getUserByUID(decoded.uid);
	}

	async loginWithGoogle(idToken: string): Promise<IUserView> {
		return this.loginWithOAuth(idToken);
	}

	async logout(uid: string): Promise<void> {
		await authUser.logout(uid);
	}

	async resetPassword(uid: string, new_psw: string): Promise<void> {
		await authUser.resetPassword(uid, new_psw);
	}

	async updateUser(user: Partial<IUserView>): Promise<boolean> {
		const uid = (user as any).uid;
		await this.userCollection.doc(uid).update({
			username: (user as any).username,
			nick: (user as any).nick,
			email: (user as any).email,
			imagePerfil: (user as any).imagePerfil,
			createdAt: (user as any).createdAt,
			lastLogin: (user as any).lastLogin,
			rankingPosition: (user as any).rankingPosition,
			xp: (user as any).xp,
		});
		return true;
	}

	async saveChapterProgress(uid: string, dto: IChapterProgressDto): Promise<void> {
		const progressRef = this.userCollection
			.doc(uid)
			.collection("challenge_progress")
			.doc(dto.desafioId);

		const snap = await progressRef.get();
		const prev = snap.exists ? snap.data()! : {};

		await progressRef.set({
			nameChallenge: dto.nameChallenge,
			capFinish: Math.max(dto.capFinish, prev.capFinish ?? 0),
			xpObtido: (prev.xpObtido ?? 0) + dto.xpObtido,
			tempoSegundos: dto.tempoSegundos,
			updatedAt: new Date(),
		}, { merge: true });
	}

	async deleteUser(uid: string): Promise<void> {
		await this.userCollection.doc(uid).delete();
	}
}
