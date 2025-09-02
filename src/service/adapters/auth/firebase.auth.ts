import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../db/firebaseConfig";

export class UserAuthService {
	async registerWithEmailAndPassword(email: string, password: string): Promise<string> {
		const userCred = await createUserWithEmailAndPassword(auth, email, password);
		return userCred.user.uid; // retorna só o UID
	}

	async registerWithGoogle(): Promise<string> {
		const provider = new GoogleAuthProvider();
		const userCred = await signInWithPopup(auth, provider);
		return userCred.user.uid;
	}
}

export const authUser = new UserAuthService()