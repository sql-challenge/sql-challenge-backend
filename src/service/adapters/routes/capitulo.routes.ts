import { Router } from "express";
import { getAll, getById, getCapituloViewById } from "../controller/capitulo.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getAll);
router.get("/view/:id", requireAuth, getCapituloViewById);
router.get("/:id", requireAuth, getById);

export default router;
