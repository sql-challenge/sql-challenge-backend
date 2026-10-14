import * as _admin from "firebase-admin";

/** Projeto Firebase de produção — dev NUNCA deve apontar para ele sem emuladores. */
const PRODUCTION_FIREBASE_PROJECT = "sqlmystery";

let _initialized = false;
let _db: FirebaseFirestore.Firestore | null = null;

/**
 * Guard de ambiente: em NODE_ENV=development, recusa inicializar o Firebase
 * apontando para o projeto de produção sem os emuladores locais.
 *
 * Use os emuladores (npm run emulators) ou, em último caso:
 *   ALLOW_FIREBASE_PROD_IN_DEV=true
 */
export function assertFirebaseDevSafety(): void {
  if (process.env.NODE_ENV !== "development") return;

  const usingEmulators =
    !!process.env.FIREBASE_AUTH_EMULATOR_HOST || !!process.env.FIRESTORE_EMULATOR_HOST;

  const projectId = process.env.FIREBASE_PROJECT_ID || "";
  const hitsProduction = projectId === PRODUCTION_FIREBASE_PROJECT;

  if (usingEmulators || !hitsProduction) return;

  const message = [
    "",
    "❌ [Firebase] NODE_ENV=development apontando para o projeto de PRODUÇÃO (sqlmystery) sem emuladores.",
    "",
    "   Em dev, use os emuladores locais (Auth + Firestore):",
    "",
    "     npm run emulators        # em outro terminal (Auth 9099 · Firestore 8080 · UI 4000)",
    "",
    "   e garanta no .env:",
    "",
    "     FIREBASE_AUTH_EMULATOR_HOST=localhost:9099",
    "     FIRESTORE_EMULATOR_HOST=localhost:8080",
    "",
    "   Se você realmente precisa usar o Firebase real em dev:",
    "",
    "     ALLOW_FIREBASE_PROD_IN_DEV=true",
    "",
  ].join("\n");

  if (process.env.ALLOW_FIREBASE_PROD_IN_DEV === "true") {
    console.warn("\n⚠️  [Firebase] Dev usando o projeto de PRODUÇÃO (ALLOW_FIREBASE_PROD_IN_DEV=true).");
    console.warn("   Dados de dev serão gravados na nuvem de produção. Use os emuladores!\n");
    return;
  }

  throw new Error(message);
}

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
