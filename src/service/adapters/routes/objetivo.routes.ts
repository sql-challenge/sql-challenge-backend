import { Router } from "express";
import { getAll, getById } from "../controller/objetivo.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getAll);
router.get("/:id", requireAuth, getById);

export default router;
