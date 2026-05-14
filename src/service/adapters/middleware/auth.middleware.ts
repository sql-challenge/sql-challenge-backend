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
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token de autenticação inválido ou expirado." });
  }
}
