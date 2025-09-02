import { User } from "../../../core/domain/user.entity";
import { IUserPort } from "../../../core/ports/user.port";
import { db } from "../../../db/firebaseConfig";
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
					docSnap.data().totalScore,
					docSnap.data().xp,
					docSnap.data().password
				)
		);
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
			data.totalScore,
			data.xp,
			data.password
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
					docSnap.data().totalScore,
					docSnap.data().xp,
					docSnap.data().password
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
			data.totalScore,
			data.xp,
			data.password
		);
	}

	async addUser(user: Omit<User, "uid" | "createdAt" | "lastLogin">): Promise<User> {
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
			imagePerfil: (user as any).imagePerfil,
			createdAt: date,
			lastLogin: date,
			totalScore: (user as any).totalScore,
			xp: (user as any).xp,
			// password: (user as any).password
		});
		return new User(
			uid,
			(user as any).username,
			(user as any).nick,
			(user as any).email,
			(user as any).imagePerfil,
			date,
			date,
			(user as any).totalScore,
			(user as any).xp,
			(user as any).password
		);
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
			totalScore: (user as any).totalScore,
			xp: (user as any).xp,
		});
		return user;
	}

	async deleteUser(uid: string): Promise<void> {
		const ref = doc(this.userCollection, uid);
		await deleteDoc(ref);
	}
}
