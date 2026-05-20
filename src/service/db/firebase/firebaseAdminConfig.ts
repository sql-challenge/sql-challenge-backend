import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import { compatFirestore } from "./firestoreCompat";
import { db as clientDb } from "./firebaseConfig";

dotenv.config();

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.projectId;

const serviceAccountPathRaw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON_PATH;
const serviceAccountPath = serviceAccountPathRaw
  ? resolve(__dirname, serviceAccountPathRaw)
  : null;
const hasServiceAccount = !!serviceAccountPath && existsSync(serviceAccountPath);

if (!admin.apps.length) {
  if (hasServiceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath!),
      });
      console.log("[Firebase Admin] Inicializado com service account:", serviceAccountPath);
    } catch (err) {
      console.error("[Firebase Admin] Service account inválida, fallback para token-only:", (err as Error).message);
      admin.initializeApp({ projectId });
    }
  } else {
    admin.initializeApp({ projectId });
    console.log("[Firebase Admin] Inicializado sem service account (token-only). projectId=" + projectId);
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
