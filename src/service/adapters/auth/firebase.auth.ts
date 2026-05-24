import { admin } from "../../db/firebase/firebaseAdminConfig";

export class UserAuthService {
	async logout(uid: string): Promise<void> {
		await admin.auth().revokeRefreshTokens(uid);
	}

	async resetPassword(uid: string, newPassword: string): Promise<void> {
		await admin.auth().updateUser(uid, { password: newPassword });
	}

	async verifyIdToken(idToken: string): Promise<{ uid: string; email?: string; name?: string; picture?: string }> {
		const decoded = await admin.auth().verifyIdToken(idToken, true);
		return {
			uid: decoded.uid,
			email: decoded.email,
			name: decoded.name,
			picture: decoded.picture,
		};
	}
}

export const authUser = new UserAuthService()
