import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { compatFirestore } from "./firestoreCompat";
import { db as clientDb } from "./firebaseConfig";

dotenv.config();

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.projectId;

const hasServiceAccount = !!(privateKey && clientEmail);

if (!admin.apps.length) {
	if (hasServiceAccount) {
		try {
			admin.initializeApp({
				credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
			});
			console.log("[Firebase Admin] Inicializado com service account.");
		} catch (err) {
			console.error("[Firebase Admin] Chave privada inválida, fallback para token-only:", (err as Error).message);
			admin.initializeApp({ projectId });
		}
	} else {
		admin.initializeApp({ projectId });
		console.log("[Firebase Admin] Inicializado sem service account (somente verificação de token).");
	}
}

const adminDb: FirebaseFirestore.Firestore | null = hasServiceAccount ? admin.firestore() : null;
if (adminDb) {
	adminDb.settings({ preferRest: true });
}

const db = hasServiceAccount
	? adminDb
	: clientDb
		? (compatFirestore(clientDb) as unknown as FirebaseFirestore.Firestore)
		: null;

export { db, admin, adminDb, hasServiceAccount };
