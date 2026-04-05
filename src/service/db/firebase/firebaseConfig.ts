import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

let app = null as unknown as FirebaseApp;
let auth = null as unknown as Auth;
let db = null as unknown as Firestore;

if (process.env.apiKey) {
	const firebaseConfig = {
		apiKey: process.env.apiKey,
		authDomain: process.env.authDomain,
		projectId: process.env.projectId,
		storageBucket: process.env.storageBucket,
		messagingSenderId: process.env.messagingSenderId,
		appId: process.env.appId,
		measurementId: process.env.measurementId,
	};

	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
	db = getFirestore(app);
} else {
	console.warn("[Firebase] apiKey não configurada — rotas de usuário indisponíveis.");
}

export { app, auth, db };
