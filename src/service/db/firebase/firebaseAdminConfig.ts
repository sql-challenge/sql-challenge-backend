import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Inicializa o Firebase Admin SDK uma única vez.
// Para verificar ID tokens (OAuth) basta o projectId — usa as chaves públicas do Google.
// Service account só é necessário para operações admin (createUser, updateUser, etc.).
if (!admin.apps.length) {
	const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
	const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
	const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.projectId;

	if (privateKey && clientEmail) {
		// Com service account — acesso total
		admin.initializeApp({
			credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
		});
		console.log("[Firebase Admin] Inicializado com service account.");
	} else {
		// Sem service account — suficiente para verifyIdToken (OAuth)
		admin.initializeApp({ projectId });
		console.log("[Firebase Admin] Inicializado sem service account (somente verificação de token).");
	}
}

export const adminDb = admin.firestore();
adminDb.settings({ preferRest: true });
export { admin };
