import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getAuth } from "firebase-admin/auth";
import { auth } from "../../db/firebaseConfig";

export class UserAuthService {
	async registerWithEmailAndPassword(email: string, password: string): Promise<string> {
		const userCred = await createUserWithEmailAndPassword(auth, email, password);
		return userCred.user.uid; // retorna só o UID
	}

	async loginWithEmailAndPassword(email: string, password: string): Promise<string> {
		const userCred = await signInWithEmailAndPassword(auth, email, password);
		return userCred.user.uid; // retorna UID se login for válido
	}

	async registerWithGoogle(idToken: string): Promise<{ uid: string; email: string; name?: string; picture?: string }> {
		const decoded = await getAuth().verifyIdToken(idToken);
		return {
			uid: decoded.uid,
			email: decoded.email || "",
			name: decoded.name,
			picture: decoded.picture,
		};
	}

	async loginWithGoogle(idToken: string): Promise<string> {
		const decoded = await getAuth().verifyIdToken(idToken);
		return decoded.uid
	}

	async logout(uid: string): Promise<void> {
		await getAuth().revokeRefreshTokens(uid);
	}

	async resetPassword(uid: string, newPassword: string): Promise<void> {
		await getAuth().updateUser(uid, { password: newPassword });
  }
}

export const authUser = new UserAuthService()