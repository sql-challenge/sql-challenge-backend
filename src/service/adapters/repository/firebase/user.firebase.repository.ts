import { User } from "../../../core/domain/user.entity";
import { IUserPort } from "../../../core/ports/user.port";
import { db } from "../../../db/firebase/firebaseConfig";
import { collection, getDocs, getDoc, doc, query, where, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { authUser } from "../../auth/firebase.auth";

export class UserFirebaseRepository implements IUserPort {
	private userCollection = collection(db, "User");

	async getAll(): Promise<User[]> {
		const snapshot = await getDocs(this.userCollection);
		return snapshot.docs.map(
			(docSnap) =>
				new User(
					docSnap.id,
					docSnap.data().username,
					docSnap.data().nick,
					docSnap.data().email,
					docSnap.data().imagePerfil,
					docSnap.data().createdAt.toDate(),
					docSnap.data().lastLogin.toDate(),
					docSnap.data().rankingPosition,
					docSnap.data().xp,
					docSnap.data().xp,
					docSnap.data().friends,
					docSnap.data().challenge_progress

				)
		)
	}

	async getUserByUID(uid: string): Promise<User> {
		const ref = doc(this.userCollection, uid);
		const docSnap = await getDoc(ref);
		if (!docSnap.exists()) throw new Error("User not found!");
		const data = docSnap.data();
		return new User(
			uid,
			data.username,
			data.nick,
			data.email,
			data.imagePerfil,
			data.createdAt.toDate(),
			data.lastLogin.toDate(),
			data.rankingPosition,
			data.xp,
			data.friends,
			data.challenge_progress
		);
	}

	async getUsersByName(name: string): Promise<User[]> {
		const q = query(this.userCollection, where("username", "==", name));
		const snapshot = await getDocs(q);
		return snapshot.docs.map(
			(docSnap) =>
				new User(
					docSnap.id,
					docSnap.data().username,
					docSnap.data().nick,
					docSnap.data().email,
					docSnap.data().imagePerfil,
					docSnap.data().createdAt.toDate(),
					docSnap.data().lastLogin.toDate(),
					docSnap.data().rankingPosition,
					docSnap.data().xp,
					docSnap.data().friends,
					docSnap.data().challenge_progress
				)
		);
	}

	async getUserByEmail(email: string): Promise<User> {
		const q = query(this.userCollection, where("email", "==", email));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("User not found!");
		const docSnap = snapshot.docs[0];
		const data = docSnap.data();
		return new User(
			docSnap.id,
			data.username,
			data.nick,
			data.email,
			data.imagePerfil,
			data.createdAt.toDate(),
			data.lastLogin.toDate(),
			data.rankingPosition,
			data.xp,
			data.friends,
			data.challenge_progress
		);
	}

	async addUser(user: Omit<User, "uid" | "createdAt" | "lastLogin" | "imagePerfil" | "rankingPosition" | "xp">): Promise<User> {
		let uid = ""
		// Auth with email and password
		uid = await authUser.registerWithEmailAndPassword((user as any).email, (user as any).password)
		console.log(uid)
		// Auth with google
		// const uid = authUser.registerWithGoogle()

		const date = new Date()
		const ref = doc(this.userCollection, uid);
		await setDoc(ref, {
			username: (user as any).username,
			nick: (user as any).nick,
			email: (user as any).email,
			imagePerfil: "",
			createdAt: date,
			lastLogin: date,
			rankingPosition: 0,
			xp: 0,
			// password: (user as any).password
		});
		return new User(
			uid,
			(user as any).username,
			(user as any).nick,
			(user as any).email,
			"",
			date,
			date,
			0,
			0,
			[{
				status: "",
				username: "",
				nick: "",
				rankingPosition: 0,
				xp: 0
			}],
			[{
				nameChallange: "",
				capFinish: 0,
				xpObtido: 0
			}]
		);
	}

	async addUserbyGoogle(idToken: string): Promise<User> {
		// valida o token e pega os dados do usuário
		const u = await authUser.registerWithGoogle(idToken);

		const date = new Date();
		const ref = doc(this.userCollection, u.uid);

		await setDoc(ref, {
			username: u.name || "",
			nick: u.name || "",
			email: u.email,
			imagePerfil: u.picture || "",
			createdAt: date,
			lastLogin: date,
			rankingPosition: -1,
			xp: 0,
		});

		return new User(
			u.uid, u.name || "", u.name || "", u.email, u.picture || "",
			date, date, 0, 0,
			[{ status: "", username: "", nick: "", rankingPosition: 0, xp: 0 }],
			[{ nameChallange: "", capFinish: 0, xpObtido: 0 }]
		);
	}

	async loginWithEmail(idToken: string): Promise<User> {
		let uid = await authUser.loginWithEmailAndPassword(idToken)
		return await this.getUserByUID(uid)
	}
	
	async loginWithGoogle(idToken: string): Promise<User> {
		let uid = await authUser.loginWithGoogle(idToken)
		return await this.getUserByUID(uid)
	}

	async logout(uid: string): Promise<void> {
		await authUser.logout(uid)
	}

	async resetPassword(uid: string, new_psw: string): Promise<void> {
		await authUser.resetPassword(uid, new_psw)
	}

	async updateUser(user: User): Promise<User> {
		const ref = doc(this.userCollection, (user as any).uid);
		await updateDoc(ref, {
			username: (user as any).username,
			nick: (user as any).nick,
			email: (user as any).email,
			imagePerfil: (user as any).imagePerfil,
			createdAt: (user as any).createdAt,
			lastLogin: (user as any).lastLogin,
			rankingPosition: (user as any).rankingPosition,
			xp: (user as any).xp,
		});
		return user;
	}

	async deleteUser(uid: string): Promise<void> {
		const ref = doc(this.userCollection, uid);
		await deleteDoc(ref);
	}
}
