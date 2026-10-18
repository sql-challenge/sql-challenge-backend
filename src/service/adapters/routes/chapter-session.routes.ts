import { Router } from "express";
import { getSession, saveSession } from "../controller/chapter-session.controller";
import { requireAuth, assertSelf } from "../middleware/auth.middleware";

const router = Router();

router.get("/:uid/:desafioId/:capituloId", requireAuth, assertSelf(), getSession);
router.post("/:uid/:desafioId/:capituloId", requireAuth, assertSelf(), saveSession);
router.patch("/:uid/:desafioId/:capituloId", requireAuth, assertSelf(), saveSession);

export default router;
