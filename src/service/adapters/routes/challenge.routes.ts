import { Router } from "express";
import challengeController from "../controller/challenge.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, (req, res) => { challengeController.getAll(req, res); });
router.get("/:id", requireAuth, (req, res) => { challengeController.getById(req, res); });
router.get("/get-by-id/:id", requireAuth, (req, res) => { challengeController.getById(req, res); });

export default router;
