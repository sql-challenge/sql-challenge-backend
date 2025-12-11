import { IUser, IUserSignUp, IUserView } from "../../../core/domain/user.entity";
import { IUserPort } from "../../../core/ports/user.port";
import { db } from "../../../db/firebase/firebaseConfig";
import { collection, getDocs, getDoc, doc, query, where, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { authUser } from "../../auth/firebase.auth";

export class UserFirebaseRepository implements IUserPort {
	private userCollection = collection(db, "User");

	async getAll(): Promise<IUserView[]> {
		const snapshot = await getDocs(this.userCollection);
		return snapshot.docs.map(
			(docSnap) => {
				return {
					challenge_progress: docSnap.data().challenge_progress,
					createdAt: docSnap.data().createdAt.toDate(),
					email: docSnap.data().email,
					friends: docSnap.data().friends,
					imagePerfil: docSnap.data().imagePerfil,
					lastLogin: docSnap.data().lastLogin.toDate(),
					rankingPosition: docSnap.data().rankingPosition,
					uid: docSnap.id,
					username: docSnap.data().username,
					xp: docSnap.data().xp,
				}
			}
		)
		// new User(
		// 			docSnap.id,
		// 			docSnap.data().username,
		// 			docSnap.data().nick,
		// 			docSnap.data().email,
		// 			docSnap.data().imagePerfil,
		// 			docSnap.data().createdAt.toDate(),
		// 			docSnap.data().lastLogin.toDate(),
		// 			docSnap.data().rankingPosition,
		// 			docSnap.data().xp,
		// 			docSnap.data().friends,
		// 			docSnap.data().challenge_progress
		// 		)
	}

	async getUserByUID(uid: string): Promise<IUserView> {
		const ref = doc(this.userCollection, uid);
		const docSnap = await getDoc(ref);
		//
		if (!docSnap.exists()) throw new Error("User not found!");
		const data = docSnap.data();
		//
		return {
			challenge_progress: data.challenge_progress,
			createdAt: data.createdAt.toDate(),
			email: data.email,
			friends: data.friends,
			imagePerfil: data.imagePerfil,
			lastLogin: data.lastLogin.toDate(),
			rankingPosition: data.rankingPosition,
			uid: docSnap.id,
			username: data.username,
			xp: data.xp,
		}
	}

	async getUsersByName(name: string): Promise<IUserView[]> {
		const q = query(this.userCollection, where("username", "==", name));
		const snapshot = await getDocs(q);
		return snapshot.docs.map(
			(docSnap) => {
				return {
					challenge_progress: docSnap.data().challenge_progress,
					createdAt: docSnap.data().createdAt.toDate(),
					email: docSnap.data().email,
					friends: docSnap.data().friends,
					imagePerfil: docSnap.data().imagePerfil,
					lastLogin: docSnap.data().lastLogin.toDate(),
					rankingPosition: docSnap.data().rankingPosition,
					uid: docSnap.id,
					username: docSnap.data().username,
					xp: docSnap.data().xp,
				}
			}
		);
	}

	async getUserByEmail(email: string): Promise<IUserView> {
		const q = query(this.userCollection, where("email", "==", email));
		const snapshot = await getDocs(q);
		//
		if (snapshot.empty) throw new Error("User not found!");
		//
		const docSnap = snapshot.docs[0];
		const data = docSnap.data();
		//
		return {
			challenge_progress: data.challenge_progress,
			createdAt: data.createdAt.toDate(),
			email: data.email,
			friends: data.friends,
			imagePerfil: data.imagePerfil,
			lastLogin: data.lastLogin.toDate(),
			rankingPosition: data.rankingPosition,
			uid: docSnap.id,
			username: data.username,
			xp: data.xp,
		}
		// return new User(
		// 	docSnap.id,
		// 	data.username,
		// 	data.nick,
		// 	data.email,
		// 	data.imagePerfil,
		// 	data.createdAt.toDate(),
		// 	data.lastLogin.toDate(),
		// 	data.rankingPosition,
		// 	data.xp,
		// 	data.friends,
		// 	data.challenge_progress
		// );
	}

	async addUser(form: IUserSignUp): Promise<IUserView> {
		let uid = "";
		// Auth with email and password
		uid = await authUser.registerWithEmailAndPassword(form.email, form.password);
		console.log('Criado usuário com uuid: ' + uid);
		// Auth with google
		// const uid = authUser.registerWithGoogle()
		// [TODO]: verify which entitys use timestamp from api and which from the database (can be divergent)
		const date = new Date()
		const ref = doc(this.userCollection, uid);
		//
		const user: IUserView = {
			username: form.username,
			email: form.email,
			createdAt: date,
			lastLogin: date,
			rankingPosition: 0,
			xp: 0,
			imagePerfil: null, // create without, set later
			friends: [],
			challenge_progress: [],
			uid: uid,
			// nick: user.nick,
			// password: user.password
		}
		//
		await setDoc(ref, {
			username: user.username,
			// nick: user.nick,
			email: user.email,
			createdAt: date,
			lastLogin: date,
			rankingPosition: 0,
			xp: 0,
			imagePerfil: user.imagePerfil, // create without, set later
			// password: user.password
		});
		//
		return user;
	}

	// async addUserbyGoogle(idToken: string): Promise<IUserView> {
	// 	// valida o token e pega os dados do usuário
	// 	const u = await authUser.registerWithGoogle(idToken);

	// 	const date = new Date();
	// 	const ref = doc(this.userCollection, u.uid);

	// 	await setDoc(ref, {
	// 		username: u.name || "",
	// 		nick: u.name || "",
	// 		email: u.email,
	// 		imagePerfil: u.picture || "",
	// 		createdAt: date,
	// 		lastLogin: date,
	// 		rankingPosition: -1,
	// 		xp: 0,
	// 	});

	// 	return new User(
	// 		u.uid, u.name || "", u.name || "", u.email, u.picture || "",
	// 		date, date, 0, 0,
	// 		[{ status: "", username: "", nick: "", rankingPosition: 0, xp: 0 }],
	// 		[{ nameChallange: "", capFinish: 0, xpObtido: 0 }]
	// 	);
	// }

	async loginWithEmail(email: string, password: string): Promise<IUserView> {
		let uid = await authUser.loginWithEmailAndPassword(email, password)
		return await this.getUserByUID(uid)
	}

	async loginWithGoogle(idToken: string): Promise<IUserView> {
		let uid = await authUser.loginWithGoogle(idToken)
		return await this.getUserByUID(uid)
	}

	async logout(uid: string): Promise<void> {
		await authUser.logout(uid)
	}

	async resetPassword(uid: string, new_psw: string): Promise<void> {
		await authUser.resetPassword(uid, new_psw)
	}

	async updateUser(user: Partial<IUserView>): Promise<boolean> {
		const ref = doc(this.userCollection, (user as any).uid);
		//
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

		return true;
	}

	async deleteUser(uid: string): Promise<void> {
		const ref = doc(this.userCollection, uid);
		await deleteDoc(ref);
	}
}
