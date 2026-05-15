import { Router } from "express";
import { getSession, saveSession } from "../controller/chapter-session.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/:uid/:desafioId/:capituloId", requireAuth, getSession);
router.post("/:uid/:desafioId/:capituloId", requireAuth, saveSession);
router.patch("/:uid/:desafioId/:capituloId", requireAuth, saveSession);

export default router;
