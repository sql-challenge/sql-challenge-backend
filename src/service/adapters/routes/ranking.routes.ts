import { Router } from "express";
import * as controller from "../controller/ranking.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Leitura do placar (username/nick/imagem/posição) — dados de exibição,
// abertos a qualquer usuário autenticado.
router.get("/", requireAuth, controller.getAll);
router.get("/username/:username", requireAuth, controller.getRankingByUsername);
router.get("/nick/:nick", requireAuth, controller.getRankingByNick);
router.get("/position/:position", requireAuth, controller.getRankingByPosition);

// Escrita no placar de TERCEIROS — apenas admin.
router.post("/", requireAuth, requireAdmin, controller.addRanking);

router.put("/updatePosition/username/:username/:newPosition", requireAuth, requireAdmin, controller.updatePositionByUsername);
router.put("/updatePosition/nick/:nick/:newPosition", requireAuth, requireAdmin, controller.updatePositionByNick);
router.put("/updateImage/username/:username", requireAuth, requireAdmin, controller.updateImageByUsername);
router.put("/updateImage/nick/:nick", requireAuth, requireAdmin, controller.updateImageByNick);

router.delete("/:username", requireAuth, requireAdmin, controller.deleteRanking);

export default router;
