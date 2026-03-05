import { Router } from "express";
import challengeController from "../controller/challenge.controller";

const router = Router();
/** GET */

router.get("/", (req, res) => {challengeController.getAll(req, res)});
router.get("/:id", (req, res) => {challengeController.getById(req, res)});
// router.put("/", (req, res) => challengeController.getById(req, res));
// router.delete("/", (req, res) => challengeController.getById(req, res));)

export default router;