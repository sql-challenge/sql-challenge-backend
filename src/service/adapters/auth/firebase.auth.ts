import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../db/firebase/firebaseConfig";
import { admin } from "../../db/firebase/firebaseAdminConfig";

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
		const decoded = await admin.auth().verifyIdToken(idToken);
		return {
			uid: decoded.uid,
			email: decoded.email || "",
			name: decoded.name,
			picture: decoded.picture,
		};
	}

	async loginWithGoogle(idToken: string): Promise<string> {
		const decoded = await admin.auth().verifyIdToken(idToken);
		return decoded.uid
	}

	async logout(uid: string): Promise<void> {
		await admin.auth().revokeRefreshTokens(uid);
	}

	async resetPassword(uid: string, newPassword: string): Promise<void> {
		await admin.auth().updateUser(uid, { password: newPassword });
	}

	/** Verifica ID token emitido pelo Firebase Client SDK e retorna os claims decodificados. */
	async verifyIdToken(idToken: string): Promise<{ uid: string; email?: string; name?: string; picture?: string }> {
		const decoded = await admin.auth().verifyIdToken(idToken);
		return {
			uid: decoded.uid,
			email: decoded.email,
			name: decoded.name,
			picture: decoded.picture,
		};
	}
}

export const authUser = new UserAuthService()