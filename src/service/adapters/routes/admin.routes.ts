import { Router } from "express";
import { getOverview } from "../controller/admin.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/overview", requireAuth, requireAdmin, getOverview);

export default router;
