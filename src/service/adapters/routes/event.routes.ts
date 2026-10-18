import { Router } from "express";
import { createEvents } from "../controller/event.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createEvents);

export default router;
