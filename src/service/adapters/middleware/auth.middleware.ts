import { Request, Response, NextFunction } from "express";
import { authUser } from "../auth/firebase.auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

/**
 * Em produção, contas de email/senha precisam ter o email verificado.
 * Google/GitHub já entregam email_verified=true no token do provedor.
 * Em dev (ou com emuladores) o gate é desativado — sem fricção local.
 */
const REQUIRE_EMAIL_VERIFICATION =
	process.env.NODE_ENV === "production" && !process.env.FIREBASE_AUTH_EMULATOR_HOST;

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticação não fornecido." });
    return;
  }

  const token = authHeader.slice(7);
  if (!token) {
    res.status(401).json({ error: "Token de autenticação vazio." });
    return;
  }

  try {
    const decoded = await authUser.verifyIdToken(token);

    if (REQUIRE_EMAIL_VERIFICATION && decoded.email_verified === false) {
      res.status(403).json({
        error: "Email não verificado. Confirme seu email para continuar.",
        code: "EMAIL_NOT_VERIFIED",
      });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token de autenticação inválido ou expirado." });
  }
}

/**
 * Garante que o :uid da rota corresponde ao uid do token.
 * Sem isso, qualquer usuário autenticado pode ler/gravar dados de outro
 * (sessions, progress, achievements…).
 */
export function assertSelf(paramName = "uid") {
	return (req: Request, res: Response, next: NextFunction): void => {
		const tokenUid = req.user?.uid;
		if (!tokenUid) {
			res.status(401).json({ error: "Usuário não autenticado." });
			return;
		}
		if (req.params[paramName] !== tokenUid) {
			res.status(403).json({ error: "Você só pode acessar os seus próprios dados.", code: "NOT_SELF" });
			return;
		}
		next();
	};
}
