import { Router } from "express";
import * as controller from "../controller/dica.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, (req, res) => controller.getAll(req, res));
router.get("/:id", requireAuth, (req, res) => controller.getById(req, res));
router.get("/capitulo/:idCapitulo", requireAuth, (req, res) => controller.getByCapituloId(req, res));

export default router;
