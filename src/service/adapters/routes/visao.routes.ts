import { Router } from "express";
import { getAll, getById, getDados } from "../controller/visao.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getAll);
router.get("/:id/dados", requireAuth, getDados);
router.get("/:id", requireAuth, getById);

export default router;
