import { Router } from "express";
import challengeController from "../controller/challenge.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, challengeController.getAll);
router.get("/:id", requireAuth, challengeController.getById);
router.get("/get-by-id/:id", requireAuth, challengeController.getById);

export default router;
