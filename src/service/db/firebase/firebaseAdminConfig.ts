import * as _admin from "firebase-admin";

let _initialized = false;
let _db: FirebaseFirestore.Firestore | null = null;

function ensureInit() {
  if (_initialized) return;
  _initialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!_admin.apps.length) {
    if (clientEmail && privateKey) {
      try {
        _admin.initializeApp({
          credential: _admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        });
      } catch (err) {
        console.error("[Firebase Admin] Credenciais inválidas, fallback para token-only:", (err as Error).message);
        _admin.initializeApp({ projectId });
      }
    } else {
      _admin.initializeApp({ projectId });
    }
  }

  _db = _admin.firestore();
  _db.settings({ preferRest: true });
}

const db = new Proxy({} as FirebaseFirestore.Firestore, {
  get(_, prop) {
    ensureInit();
    return _db![prop as keyof FirebaseFirestore.Firestore];
  },
});

const admin = new Proxy(_admin, {
  get(target, prop) {
    ensureInit();
    return (target as any)[prop];
  },
});

export { db, admin };

/** Expõe o estado de inicialização para testes */
export function isFirebaseReady(): boolean {
  return _initialized;
}
