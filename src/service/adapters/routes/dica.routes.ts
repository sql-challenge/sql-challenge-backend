import { Router } from "express";
import * as controller from "../controller/dica.controller";

const router = Router();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.get("/capitulo/:idCapitulo", (req, res) => controller.getByCapituloId(req, res));

export default router;
