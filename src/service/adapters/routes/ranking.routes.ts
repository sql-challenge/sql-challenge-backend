import { Router } from "express";
import * as controller from "../controller/ranking.controller";

const router = Router();

// GET
router.get("/", (req, res) => { controller.getAll(req, res) });
router.get("/username/:username", (req, res) => { controller.getRankingByUsername(req, res) });
router.get("/nick/:nick", (req, res) => { controller.getRankingByNick(req, res) });
router.get("/position/:position", (req, res) => { controller.getRankingByPosition(req, res) });

// POST
router.post("/", (req, res) => { controller.addRanking(req, res) });

// PUT
router.put("/updatePosition/username/:username/:newPosition", (req, res) => { controller.updatePositionByUsername(req, res) });
router.put("/updatePosition/nick/:nick/:newPosition", (req, res) => { controller.updatePositionByNick(req, res) });
router.put("/updateImage/username/:username", (req, res) => { controller.updateImageByUsername(req, res) });
router.put("/updateImage/nick/:nick", (req, res) => { controller.updateImageByNick(req, res) });

// DELETE
router.delete("/:username", (req, res) => { controller.deleteRanking(req, res) });

export default router;
