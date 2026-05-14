import { Router } from "express";
import * as controller from "../controller/capitulo.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, (req, res) => controller.getAll(req, res));
router.get("/view/:id", requireAuth, (req, res) => controller.getCapituloViewById(req, res));
router.get("/:id", requireAuth, (req, res) => controller.getById(req, res));

export default router;
