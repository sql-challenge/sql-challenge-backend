import { Router } from "express";
import challengeController from "../controller/challenge.controller";

const router = Router();
/** GET */

router.get("/", (req, res) => {challengeController.getAll(req, res)});
router.get("/:id", (req, res) => {challengeController.getById(req, res)});
router.get("/get-by-id/:id", (req, res) => {challengeController.getById(req, res)});
// router.post("/get-with-capitulo", (req, res) => {challengeController.getWithCapitulo(req, res)});
// router.put("/", (req, res) => challengeController.getById(req, res));
// router.delete("/", (req, res) => challengeController.getById(req, res));)

export default router;