import { Router } from "express";
import { getAll, getById, getByCapituloId } from "../controller/dica.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getAll);
router.get("/:id", requireAuth, getById);
router.get("/capitulo/:idCapitulo", requireAuth, getByCapituloId);

export default router;
