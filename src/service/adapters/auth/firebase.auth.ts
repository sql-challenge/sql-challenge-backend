import { getAuth } from "firebase-admin/auth";

export class UserAuthService {
	async registerWithEmailAndPassword(email: string, password: string): Promise<string> {
		const user = await getAuth().createUser({ email, password });
		return user.uid;
	}

	async registerWithGoogle(idToken: string) {
		const decoded = await getAuth().verifyIdToken(idToken);
		return {
			uid: decoded.uid,
			email: decoded.email || "",
			name: decoded.name,
			picture: decoded.picture,
		};
	}

	async loginWithEmailAndPassword(idToken: string): Promise<string> {
		const decoded = await getAuth().verifyIdToken(idToken);
		return decoded.uid;
	}

	async loginWithGoogle(idToken: string): Promise<string> {
		const decoded = await getAuth().verifyIdToken(idToken);
		return decoded.uid;
	}

	async logout(uid: string): Promise<void> {
		await getAuth().revokeRefreshTokens(uid);
	}

	async resetPassword(uid: string, newPassword: string): Promise<void> {
		await getAuth().updateUser(uid, { password: newPassword });
	}
}

export const authUser = new UserAuthService();
