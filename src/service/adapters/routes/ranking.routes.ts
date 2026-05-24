import { Router } from "express";
import * as controller from "../controller/ranking.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, controller.getAll);
router.get("/username/:username", requireAuth, controller.getRankingByUsername);
router.get("/nick/:nick", requireAuth, controller.getRankingByNick);
router.get("/position/:position", requireAuth, controller.getRankingByPosition);

router.post("/", requireAuth, controller.addRanking);

router.put("/updatePosition/username/:username/:newPosition", requireAuth, controller.updatePositionByUsername);
router.put("/updatePosition/nick/:nick/:newPosition", requireAuth, controller.updatePositionByNick);
router.put("/updateImage/username/:username", requireAuth, controller.updateImageByUsername);
router.put("/updateImage/nick/:nick", requireAuth, controller.updateImageByNick);

router.delete("/:username", requireAuth, controller.deleteRanking);

export default router;
