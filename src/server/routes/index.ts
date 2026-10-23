import express, { type Request } from "express";
import userRoutes from '../../service/adapters/routes/user.routes'
import capituloRoutes from '../../service/adapters/routes/capitulo.routes'
import cors from "cors";
import challengeRoutes from "../../service/adapters/routes/challenge.routes";
import sessionRoutes from "../../service/adapters/routes/chapter-session.routes";
import eventRoutes from "../../service/adapters/routes/event.routes";
import adminRoutes from "../../service/adapters/routes/admin.routes";
import rankingRoutes from '../../service/adapters/routes/ranking.routes'
import desafioRoutes from '../../service/adapters/routes/desafio.routes'
import objetivoRoutes from '../../service/adapters/routes/objetivo.routes'
import consultaRoutes from '../../service/adapters/routes/consulta.routes'
import dicaRoutes from '../../service/adapters/routes/dica.routes'
import visaoRoutes from '../../service/adapters/routes/visao.routes'
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { requestLogger } from "../../service/adapters/middleware/logging.middleware";

const routes = express();
routes.disable("x-powered-by");

// Atrás de proxy (nginx ingress / nginx do frontend), o IP real do cliente
// só chega via X-Forwarded-For. Habilitar por env: TRUST_PROXY=true.
// Sem proxy no meio, NÃO habilitar — XFF controlado pelo cliente seria
// aceito como req.ip (spoofable).
if (process.env.TRUST_PROXY === "true") {
	routes.set("trust proxy", 1);
}

// ── Rate limiting por aluno ──────────────────────────────────
// Chaveia por uid (extraído SEM verificação — só para keying de rate limit,
// nunca para autorização) quando há token; cai para IP caso contrário.
// Essencial em sala de aula: NAT da escola colapsa todos os alunos no
// mesmo IP — limitar por IP bloquearia a turma inteira coletivamente.
function rateLimitKey(req: Request): string {
	const auth = req.headers.authorization;
	if (auth?.startsWith("Bearer ")) {
		try {
			const payload = JSON.parse(Buffer.from(auth.slice(7).split(".")[1] ?? "", "base64url").toString());
			if (payload?.sub) return `uid:${payload.sub}`;
		} catch {
			// token malformado → keying por IP
		}
	}
	// IPv6: usa o helper oficial do express-rate-limit (senão valida como
	// ERR_ERL_KEY_GEN_IPV6 e polui o boot); chaveia por sub-rede /56.
	return `ip:${ipKeyGenerator(req.ip ?? "unknown")}`;
}

routes.use(requestLogger);

const frontendUrl = process.env.FRONTEND_URL;
const validatedFrontendUrl = frontendUrl && frontendUrl !== "undefined"
	? frontendUrl
	: undefined;

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"https://sql-challenge.atcfalcons.org",
	validatedFrontendUrl,
].filter((o): o is string => !!o);

routes.use(cors({
	origin: (origin, callback) => {
		if (!origin) return callback(null, false);
		const allowed = allowedOrigins.some(o => origin.startsWith(o));
		callback(null, allowed);
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
	maxAge: 3600,
}));

// Health check (before rate limiting so monitoring is never blocked)
routes.get("/api/health", (_req, res) => {
	res.json({ status: "ok" });
});

// Rate limiting — todos por rateLimitKey (uid quando autenticado, senão IP)
const generalLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 200,
	keyGenerator: rateLimitKey,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Muitas requisições. Tente novamente em instantes." },
});
routes.use(generalLimiter);

// Burst de login no início da aula: turma inteira entra em ~1 min
const authLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 60,
	keyGenerator: rateLimitKey,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Muitas tentativas de autenticação. Tente novamente em instantes." },
});
routes.use("/api/user/auth", authLimiter);

// Escritas: 60/min absorve rajadas legítimas (vitória de capítulo encadeia
// PATCH de sessão + POST de progresso + telemetria); abuso continua sendo
// auditado por flags, não por throttling.
const mutationLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 60,
	keyGenerator: rateLimitKey,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Muitas requisições de escrita. Tente novamente em instantes." },
	skip: (req) => req.method === "GET",
});
routes.use(mutationLimiter);

routes.use("/api/user", userRoutes);
routes.use("/api/challenge", challengeRoutes);
routes.use("/api/sessions", sessionRoutes);
routes.use("/api/events", eventRoutes);
routes.use("/api/admin", adminRoutes);
routes.use("/api/capitulo", capituloRoutes);
routes.use("/api/ranking", rankingRoutes);
routes.use("/api/desafios", desafioRoutes);
routes.use("/api/objetivos", objetivoRoutes);
routes.use("/api/consultas", consultaRoutes);
routes.use("/api/dicas", dicaRoutes);
routes.use("/api/visoes", visaoRoutes);

export default routes;
