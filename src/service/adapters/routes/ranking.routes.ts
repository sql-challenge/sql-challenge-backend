import { Router } from "express";
import * as controller from "../controller/ranking.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, (req, res) => { controller.getAll(req, res); });
router.get("/username/:username", requireAuth, (req, res) => { controller.getRankingByUsername(req, res); });
router.get("/nick/:nick", requireAuth, (req, res) => { controller.getRankingByNick(req, res); });
router.get("/position/:position", requireAuth, (req, res) => { controller.getRankingByPosition(req, res); });

router.post("/", requireAuth, (req, res) => { controller.addRanking(req, res); });

router.put("/updatePosition/username/:username/:newPosition", requireAuth, (req, res) => { controller.updatePositionByUsername(req, res); });
router.put("/updatePosition/nick/:nick/:newPosition", requireAuth, (req, res) => { controller.updatePositionByNick(req, res); });
router.put("/updateImage/username/:username", requireAuth, (req, res) => { controller.updateImageByUsername(req, res); });
router.put("/updateImage/nick/:nick", requireAuth, (req, res) => { controller.updateImageByNick(req, res); });

router.delete("/:username", requireAuth, (req, res) => { controller.deleteRanking(req, res); });

export default router;
