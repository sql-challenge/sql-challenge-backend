import { IUser, IUserSignUp, IUserView, Friend, ChallengeProgress } from "../../../core/domain/user.entity";
import { IChapterProgressDto, IUserPort } from "../../../core/ports/user.port";
import { db as firestore, adminDb, hasServiceAccount } from "../../../db/firebase/firebaseAdminConfig";
import { authUser } from "../../auth/firebase.auth";
import { firestoreGetDoc, firestoreSetDoc, firestoreUpdateDoc } from "./firestoreRest";
import { FieldValue } from "firebase-admin/firestore";

export class UserFirebaseRepository implements IUserPort {
	private get userCollection() { return firestore!.collection("User"); }

	private async withFallback<T>(op: () => Promise<T>, fallback: T, methodName: string): Promise<T> {
		if (hasServiceAccount) return op();
		try {
			return await op();
		} catch (err) {
			console.error(`[Firebase] ${methodName}: requires Admin SDK credentials — ${(err as Error).message}`, (err as Error).stack);
			return fallback;
		}
	}

	private toDate(v: unknown): Date {
		if (v instanceof Date) return v;
		if (v && typeof (v as FirebaseFirestore.Timestamp).toDate === "function") return (v as FirebaseFirestore.Timestamp).toDate();
		return new Date();
	}

	private mapDoc(id: string, data: Record<string, unknown>): IUserView {
		return {
			uid: id,
			username: (data.username as string) ?? "",
			nick: (data.nick as string) ?? "",
			email: (data.email as string) ?? "",
			imagePerfil: (data.imagePerfil as string | null) ?? null,
			createdAt: this.toDate(data.createdAt) ?? new Date(),
			lastLogin: this.toDate(data.lastLogin) ?? new Date(),
			rankingPosition: (data.rankingPosition as number) ?? 0,
			xp: (data.xp as number) ?? 0,
			friends: Array.isArray(data.friends) ? data.friends : [],
			challenge_progress: Array.isArray(data.challenge_progress) ? data.challenge_progress : [],
			awardedAchievements: Array.isArray(data.awardedAchievements) ? data.awardedAchievements : [],
			emailNotifications: (data.emailNotifications as boolean) ?? false,
		};
	}

	async getAll(): Promise<IUserView[]> {
		return this.withFallback(async () => {
			const snapshot = await this.userCollection.get();
			return snapshot.docs.map(d => this.mapDoc(d.id, d.data()));
		}, [], "getAll");
	}

	async getTopByXP(limit = 20): Promise<IUserView[]> {
		return this.withFallback(async () => {
			const snapshot = await this.userCollection.orderBy("xp", "desc").limit(limit).get();
			return snapshot.docs.map(d => this.mapDoc(d.id, d.data()));
		}, [], "getTopByXP");
	}

	async getUserByUID(uid: string, idToken?: string): Promise<IUserView> {
		return this.withFallback(async () => {
			if (hasServiceAccount) {
				const snap = await this.userCollection.doc(uid).get();
				if (!snap.exists) throw new Error("User not found!");
				return this.mapDoc(snap.id, snap.data()!);
			}
			if (!idToken) {
				console.error(`[Firebase] getUserByUID: sem service account e sem idToken — impossível buscar usuário`);
				throw new Error("Firestore REST requer idToken — configure FIREBASE_ADMIN_PRIVATE_KEY no .env");
			}
			const data = await firestoreGetDoc(idToken, "User", uid);
			if (!data) throw new Error("User not found!");
			return this.mapDoc(uid, data);
		}, null as unknown as IUserView, "getUserByUID");
	}

	async getUsersByName(name: string): Promise<IUserView[]> {
		return this.withFallback(async () => {
			const lower = name.toLowerCase();
			const snapshot = await this.userCollection
				.where("username", ">=", lower)
				.where("username", "<=", lower + "\uf8ff")
				.limit(10)
				.get();
			return snapshot.docs.map(d => this.mapDoc(d.id, d.data()));
		}, [], "getUsersByName");
	}

	async getUserByEmail(email: string): Promise<IUserView> {
		return this.withFallback(async () => {
			const snapshot = await this.userCollection.where("email", "==", email).get();
			if (snapshot.empty) throw new Error("User not found!");
			const d = snapshot.docs[0];
			return this.mapDoc(d.id, d.data());
		}, null as unknown as IUserView, "getUserByEmail");
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
		try {
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
		} catch (err) {
			console.error(`[Firebase] addUser: Auth user created but Firestore write failed — ${(err as Error).message}`);
		}
		console.error("Usuário criado:", user);
		return user;
	}

	async loginWithEmail(email: string, password: string): Promise<IUserView> {
		const uid = await authUser.loginWithEmailAndPassword(email, password);
		return this.getUserByUID(uid);
	}

	async loginWithOAuth(idToken: string, displayName?: string, photoURL?: string): Promise<IUserView> {
		const decoded = await authUser.verifyIdToken(idToken);
		const uid = decoded.uid;

		const newUserDoc = this.buildUserDoc(decoded, displayName, photoURL);

		if (hasServiceAccount) {
			const ref = this.userCollection.doc(uid);
			const snap = await ref.get();
			if (!snap.exists) {
				await ref.set(newUserDoc);
			} else {
				const existing = snap.data()!;
				const updates: Record<string, unknown> = { lastLogin: new Date() };
				if (!existing.username  && newUserDoc.username)  updates.username    = newUserDoc.username;
				if (!existing.nick      && newUserDoc.nick)      updates.nick        = newUserDoc.nick;
				if (!existing.email     && newUserDoc.email)     updates.email       = newUserDoc.email;
				if (!existing.imagePerfil && newUserDoc.imagePerfil) updates.imagePerfil = newUserDoc.imagePerfil;
				await ref.update(updates);
			}
		} else {
			const existing = await firestoreGetDoc(idToken, "User", uid);
			if (!existing) {
				await firestoreSetDoc(idToken, "User", uid, newUserDoc);
			} else {
				const updates: Record<string, unknown> = { lastLogin: new Date() };
				if (!existing.username  && newUserDoc.username)  updates.username    = newUserDoc.username;
				if (!existing.nick      && newUserDoc.nick)      updates.nick        = newUserDoc.nick;
				if (!existing.email     && newUserDoc.email)     updates.email       = newUserDoc.email;
				if (!existing.imagePerfil && newUserDoc.imagePerfil) updates.imagePerfil = newUserDoc.imagePerfil;
				await firestoreUpdateDoc(idToken, "User", uid, updates);
			}
		}

		return this.getUserByUID(uid, idToken);
	}

	private buildUserDoc(decoded: { uid: string; email?: string; name?: string; picture?: string }, displayName?: string, photoURL?: string) {
		const date = new Date();
		const name = displayName || decoded.name || decoded.email?.split("@")[0] || "Detetive";
		return {
			username: name,
			nick: name,
			email: decoded.email ?? "",
			imagePerfil: photoURL || decoded.picture || null,
			createdAt: date,
			lastLogin: date,
			rankingPosition: 0,
			xp: 0,
			friends: [],
			challenge_progress: [],
		};
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

	async updateUser(user: Partial<IUserView>, idToken?: string): Promise<IUserView> {
		return this.withFallback(async () => {
			const uid = user.uid!;
			const updates: Record<string, unknown> = {};
			if (user.username           !== undefined) updates.username           = user.username;
			if (user.nick               !== undefined) updates.nick               = user.nick;
			if (user.email              !== undefined) updates.email              = user.email;
			if (user.imagePerfil        !== undefined) updates.imagePerfil        = user.imagePerfil;
			if (user.xp                 !== undefined) updates.xp                 = user.xp;
			if (user.rankingPosition    !== undefined) updates.rankingPosition    = user.rankingPosition;
			if (user.emailNotifications !== undefined) updates.emailNotifications = user.emailNotifications;

			if (hasServiceAccount) {
				await this.userCollection.doc(uid).update(updates);
			} else {
				if (!idToken) throw new Error("Firestore REST requer idToken para updateUser");
				await firestoreUpdateDoc(idToken, "User", uid, updates);
			}

			return this.getUserByUID(uid, idToken);
		}, null as unknown as IUserView, "updateUser");
	}

	// ── Friends ────────────────────────────────────────────────

	async addFriend(uid: string, targetUid: string): Promise<void> {
		return this.withFallback(async () => {
			const [mySnap, targetSnap] = await Promise.all([
				this.userCollection.doc(uid).get(),
				this.userCollection.doc(targetUid).get(),
			]);
			if (!mySnap.exists || !targetSnap.exists) throw new Error("User not found");

			const me = mySnap.data()!;
			const target = targetSnap.data()!;

			const myFriends: Friend[] = me.friends ?? [];
			const targetFriends: Friend[] = target.friends ?? [];

			if (myFriends.some(f => f.uid === targetUid)) throw new Error("Já são amigos ou solicitação pendente");

			myFriends.push({ uid: targetUid, status: "pending", username: target.username, nick: target.nick ?? "", rankingPosition: target.rankingPosition ?? 0, xp: target.xp ?? 0 });
			targetFriends.push({ uid, status: "pending", username: me.username, nick: me.nick ?? "", rankingPosition: me.rankingPosition ?? 0, xp: me.xp ?? 0 });

			await Promise.all([
				this.userCollection.doc(uid).update({ friends: myFriends }),
				this.userCollection.doc(targetUid).update({ friends: targetFriends }),
			]);
		}, undefined as unknown as void, "addFriend");
	}

	async acceptFriend(uid: string, targetUid: string): Promise<void> {
		return this.withFallback(async () => {
			const [mySnap, targetSnap] = await Promise.all([
				this.userCollection.doc(uid).get(),
				this.userCollection.doc(targetUid).get(),
			]);
			if (!mySnap.exists || !targetSnap.exists) throw new Error("User not found");

			const updateFriends = (friends: Friend[], otherId: string) =>
				friends.map(f => f.uid === otherId ? { ...f, status: "accepted" as const } : f);

			await Promise.all([
				this.userCollection.doc(uid).update({ friends: updateFriends(mySnap.data()!.friends ?? [], targetUid) }),
				this.userCollection.doc(targetUid).update({ friends: updateFriends(targetSnap.data()!.friends ?? [], uid) }),
			]);
		}, undefined as unknown as void, "acceptFriend");
	}

	async removeFriend(uid: string, targetUid: string): Promise<void> {
		return this.withFallback(async () => {
			const [mySnap, targetSnap] = await Promise.all([
				this.userCollection.doc(uid).get(),
				this.userCollection.doc(targetUid).get(),
			]);
			if (!mySnap.exists || !targetSnap.exists) throw new Error("User not found");

			await Promise.all([
				this.userCollection.doc(uid).update({ friends: (mySnap.data()!.friends ?? []).filter((f: Friend) => f.uid !== targetUid) }),
				this.userCollection.doc(targetUid).update({ friends: (targetSnap.data()!.friends ?? []).filter((f: Friend) => f.uid !== uid) }),
			]);
		}, undefined as unknown as void, "removeFriend");
	}

	async getFriends(uid: string, idToken?: string): Promise<Friend[]> {
		if (hasServiceAccount) {
			const snap = await this.userCollection.doc(uid).get();
			if (!snap.exists) return [];
			return snap.data()!.friends ?? [];
		}
		if (!idToken) return [];
		try {
			const data = await firestoreGetDoc(idToken, "User", uid);
			if (!data) return [];
			return Array.isArray(data.friends) ? data.friends as Friend[] : [];
		} catch (err) {
			console.error(`[Firebase] getFriends: ${(err as Error).message}`, (err as Error).stack);
			return [];
		}
	}

	async getFriendsRanking(uid: string): Promise<IUserView[]> {
		return this.withFallback(async () => {
			const snap = await this.userCollection.doc(uid).get();
			if (!snap.exists) throw new Error("User not found");
			const friends: Friend[] = (snap.data()!.friends ?? []).filter((f: Friend) => f.status === "accepted");
			const friendUids = friends.map(f => f.uid);

			const me = this.mapDoc(snap.id, snap.data()!);
			if (friendUids.length === 0) return [me];

			const friendSnaps = await Promise.all(friendUids.map((fuid: string) => this.userCollection.doc(fuid).get()));
			const friendUsers = friendSnaps.filter(s => s.exists).map(s => this.mapDoc(s.id, s.data()!));

			return [me, ...friendUsers].sort((a, b) => b.xp - a.xp);
		}, [], "getFriendsRanking");
	}

	// ── Achievements ───────────────────────────────────────────

	async awardAchievement(uid: string, achievementId: string, xpBonus: number): Promise<boolean> {
		return this.withFallback(async () => {
			const ref = this.userCollection.doc(uid);
			const snap = await ref.get();
			if (!snap.exists) throw new Error("User not found");

			const data = snap.data()!;
			const awarded: string[] = data.awardedAchievements ?? [];
			if (awarded.includes(achievementId)) return false;

			await ref.update({
				awardedAchievements: FieldValue.arrayUnion(achievementId),
				xp: FieldValue.increment(xpBonus),
			});
			return true;
		}, false, "awardAchievement");
	}

	async saveChapterProgress(uid: string, dto: IChapterProgressDto): Promise<void> {
		return this.withFallback(async () => {
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

			const userRef = this.userCollection.doc(uid);
			const userSnap = await userRef.get();
			if (!userSnap.exists) return;

			const userData = userSnap.data()!;
			const existing: ChallengeProgress[] = userData.challenge_progress ?? [];
			const idx = existing.findIndex(p => p.nameChallenge === dto.desafioId);

			const updatedEntry: ChallengeProgress = {
				nameChallenge: dto.desafioId,
				capFinish: Math.max(dto.capFinish, idx >= 0 ? (existing[idx].capFinish ?? 0) : 0),
				xpObtido: (idx >= 0 ? (existing[idx].xpObtido ?? 0) : 0) + xpToAdd,
				totalQueries: (idx >= 0 ? (existing[idx].totalQueries ?? 0) : 0) + (dto.totalQueries ?? 0),
				totalHints: (idx >= 0 ? (existing[idx].totalHints ?? 0) : 0) + (dto.totalHints ?? 0),
				totalSeconds: (idx >= 0 ? (existing[idx].totalSeconds ?? 0) : 0) + dto.tempoSegundos,
			};

			const updatedProgress = idx >= 0
				? existing.map((p, i) => i === idx ? updatedEntry : p)
				: [...existing, updatedEntry];

			await userRef.update({
				challenge_progress: updatedProgress,
				xp: FieldValue.increment(xpToAdd),
			});
		}, undefined as unknown as void, "saveChapterProgress");
	}

	async deleteUser(uid: string): Promise<void> {
		return this.withFallback(async () => {
			await this.userCollection.doc(uid).delete();
		}, undefined as unknown as void, "deleteUser");
	}
}
