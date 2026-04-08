// src/adapters/routes/capitulo.routes.ts

import { Router } from "express";
import * as controller from "../controller/capitulo.controller";

const router = Router();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/view/:id", (req, res) => controller.getCapituloViewById(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
// router.post("/", (req, res) => controller.create(req, res));
// router.put("/:id", (req, res) => controller.update(req, res));
// router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
