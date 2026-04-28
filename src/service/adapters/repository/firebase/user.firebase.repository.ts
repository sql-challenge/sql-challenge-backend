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
			awardedAchievements: data.awardedAchievements ?? [],
			emailNotifications: data.emailNotifications ?? false,
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
		const lower = name.toLowerCase();
		const snapshot = await this.userCollection
			.where("username", ">=", lower)
			.where("username", "<=", lower + "\uf8ff")
			.limit(10)
			.get();
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
		const uid = user.uid!;
		const updates: Record<string, any> = {};
		if (user.username           !== undefined) updates.username           = user.username;
		if (user.nick               !== undefined) updates.nick               = user.nick;
		if (user.email              !== undefined) updates.email              = user.email;
		if (user.imagePerfil        !== undefined) updates.imagePerfil        = user.imagePerfil;
		if (user.xp                 !== undefined) updates.xp                 = user.xp;
		if (user.rankingPosition    !== undefined) updates.rankingPosition    = user.rankingPosition;
		if (user.emailNotifications !== undefined) updates.emailNotifications = user.emailNotifications;
		await this.userCollection.doc(uid).update(updates);
		return true;
	}

	// ── Friends ────────────────────────────────────────────────

	async addFriend(uid: string, targetUid: string): Promise<void> {
		const [mySnap, targetSnap] = await Promise.all([
			this.userCollection.doc(uid).get(),
			this.userCollection.doc(targetUid).get(),
		]);
		if (!mySnap.exists || !targetSnap.exists) throw new Error("User not found");

		const me = mySnap.data()!;
		const target = targetSnap.data()!;

		const myFriends: any[] = me.friends ?? [];
		const targetFriends: any[] = target.friends ?? [];

		if (myFriends.some((f: any) => f.uid === targetUid)) throw new Error("Já são amigos ou solicitação pendente");

		myFriends.push({ uid: targetUid, status: "pending", username: target.username, nick: target.nick ?? "", rankingPosition: target.rankingPosition ?? 0, xp: target.xp ?? 0 });
		targetFriends.push({ uid, status: "pending", username: me.username, nick: me.nick ?? "", rankingPosition: me.rankingPosition ?? 0, xp: me.xp ?? 0 });

		await Promise.all([
			this.userCollection.doc(uid).update({ friends: myFriends }),
			this.userCollection.doc(targetUid).update({ friends: targetFriends }),
		]);
	}

	async acceptFriend(uid: string, targetUid: string): Promise<void> {
		const [mySnap, targetSnap] = await Promise.all([
			this.userCollection.doc(uid).get(),
			this.userCollection.doc(targetUid).get(),
		]);
		if (!mySnap.exists || !targetSnap.exists) throw new Error("User not found");

		const updateFriends = (friends: any[], otherId: string) =>
			friends.map((f: any) => f.uid === otherId ? { ...f, status: "accepted" } : f);

		await Promise.all([
			this.userCollection.doc(uid).update({ friends: updateFriends(mySnap.data()!.friends ?? [], targetUid) }),
			this.userCollection.doc(targetUid).update({ friends: updateFriends(targetSnap.data()!.friends ?? [], uid) }),
		]);
	}

	async removeFriend(uid: string, targetUid: string): Promise<void> {
		const [mySnap, targetSnap] = await Promise.all([
			this.userCollection.doc(uid).get(),
			this.userCollection.doc(targetUid).get(),
		]);
		if (!mySnap.exists || !targetSnap.exists) throw new Error("User not found");

		await Promise.all([
			this.userCollection.doc(uid).update({ friends: (mySnap.data()!.friends ?? []).filter((f: any) => f.uid !== targetUid) }),
			this.userCollection.doc(targetUid).update({ friends: (targetSnap.data()!.friends ?? []).filter((f: any) => f.uid !== uid) }),
		]);
	}

	async getFriends(uid: string): Promise<import("../../../core/domain/user.entity").Friend[]> {
		const snap = await this.userCollection.doc(uid).get();
		if (!snap.exists) throw new Error("User not found");
		return snap.data()!.friends ?? [];
	}

	async getFriendsRanking(uid: string): Promise<IUserView[]> {
		const snap = await this.userCollection.doc(uid).get();
		if (!snap.exists) throw new Error("User not found");
		const friends: any[] = (snap.data()!.friends ?? []).filter((f: any) => f.status === "accepted");
		const friendUids = friends.map((f: any) => f.uid);

		const me = this.mapDoc(snap.id, snap.data()!);
		if (friendUids.length === 0) return [me];

		const friendSnaps = await Promise.all(friendUids.map((fuid: string) => this.userCollection.doc(fuid).get()));
		const friendUsers = friendSnaps.filter(s => s.exists).map(s => this.mapDoc(s.id, s.data()!));

		return [me, ...friendUsers].sort((a, b) => b.xp - a.xp);
	}

	// ── Achievements ───────────────────────────────────────────

	async awardAchievement(uid: string, achievementId: string, xpBonus: number): Promise<boolean> {
		const ref = this.userCollection.doc(uid);
		const snap = await ref.get();
		if (!snap.exists) throw new Error("User not found");

		const data = snap.data()!;
		const awarded: string[] = data.awardedAchievements ?? [];
		if (awarded.includes(achievementId)) return false; // já concedido

		await ref.update({
			awardedAchievements: [...awarded, achievementId],
			xp: (data.xp ?? 0) + xpBonus,
		});
		return true;
	}

	async saveChapterProgress(uid: string, dto: IChapterProgressDto): Promise<void> {
		// 1. Subcollection — histórico detalhado por desafio
		const progressRef = this.userCollection
			.doc(uid)
			.collection("challenge_progress")
			.doc(dto.desafioId);

		const snap = await progressRef.get();
		const prev = snap.exists ? snap.data()! : {};
		const prevCapFinish = Number(prev.capFinish ?? 0);
		const shouldGrantXp = Number(dto.capFinish) > prevCapFinish;
		const xpToAdd = shouldGrantXp ? Number(dto.xpObtido) : 0;

		await progressRef.set({
			nameChallenge: dto.nameChallenge,
			capFinish: Math.max(dto.capFinish, prevCapFinish),
			xpObtido: (prev.xpObtido ?? 0) + xpToAdd,
			totalQueries: (prev.totalQueries ?? 0) + (dto.totalQueries ?? 0),
			totalHints: (prev.totalHints ?? 0) + (dto.totalHints ?? 0),
			tempoSegundos: (prev.tempoSegundos ?? 0) + dto.tempoSegundos,
			updatedAt: new Date(),
		}, { merge: true });

		// 2. Documento principal — array challenge_progress para radar/conquistas + xp
		const userRef = this.userCollection.doc(uid);
		const userSnap = await userRef.get();
		if (!userSnap.exists) return;

		const userData = userSnap.data()!;
		const existing: any[] = userData.challenge_progress ?? [];
		const idx = existing.findIndex((p: any) => p.nameChallange === dto.desafioId);

		const updatedEntry = {
			nameChallange: dto.desafioId,
			capFinish: Math.max(dto.capFinish, idx >= 0 ? (existing[idx].capFinish ?? 0) : 0),
			xpObtido: (idx >= 0 ? (existing[idx].xpObtido ?? 0) : 0) + xpToAdd,
			totalQueries: (idx >= 0 ? (existing[idx].totalQueries ?? 0) : 0) + (dto.totalQueries ?? 0),
			totalHints: (idx >= 0 ? (existing[idx].totalHints ?? 0) : 0) + (dto.totalHints ?? 0),
			totalSeconds: (idx >= 0 ? (existing[idx].totalSeconds ?? 0) : 0) + dto.tempoSegundos,
		};

		const updatedProgress = idx >= 0
			? existing.map((p: any, i: number) => i === idx ? updatedEntry : p)
			: [...existing, updatedEntry];

		await userRef.update({
			challenge_progress: updatedProgress,
			xp: (userData.xp ?? 0) + xpToAdd,
		});
	}

	async deleteUser(uid: string): Promise<void> {
		await this.userCollection.doc(uid).delete();
	}
}
