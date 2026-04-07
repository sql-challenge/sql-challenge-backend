import { Router } from "express";
import { getSession, saveSession } from "../controller/chapter-session.controller";

const router = Router();

// Retorna (ou cria vazio) a sessão de um capítulo para o usuário
router.get("/:uid/:desafioId/:capituloId", getSession);

// Salva progresso + tempo decorrido (chamado periodicamente e no fechamento da página)
router.patch("/:uid/:desafioId/:capituloId", saveSession);

export default router;
