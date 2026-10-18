import { Router } from "express";
import { getOverview, getStudentEvents, getFlags } from "../controller/admin.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/overview", requireAuth, requireAdmin, getOverview);
router.get("/students/:uid/events", requireAuth, requireAdmin, getStudentEvents);
router.get("/flags", requireAuth, requireAdmin, getFlags);

export default router;
