import { Router } from "express";
import * as controller from "../controller/visao.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, (req, res) => controller.getAll(req, res));
router.get("/:id/dados", requireAuth, (req, res) => controller.getDados(req, res));
router.get("/:id", requireAuth, (req, res) => controller.getById(req, res));

export default router;
