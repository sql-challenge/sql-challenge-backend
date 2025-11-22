// src/adapters/routes/capitulo.routes.ts

import { Router } from "express";
import * as controller from "../controller/capitulo.controller";

const router = Router();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));

export default router;
