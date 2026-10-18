import { Router } from "express";
import * as controller from "../controller/user.controller";
import { requireAuth, assertSelf, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// ── Public routes (no auth required) ──────────────────────────
router.post("/auth/oauth", controller.loginWithOAuth);

// ── Protected routes (auth required) ──────────────────────────

/** GET */
router.get("/top", controller.getTopByXP);
router.get("/token/valid", requireAuth, controller.verifyToken);
// Listagem completa, busca por nome e por email expõem dados de TERCEIROS
// (incl. email) — apenas admin.
router.get("/", requireAuth, requireAdmin, controller.getAll);
router.get("/uid/:uid", requireAuth, assertSelf(), controller.getUserByUID);
router.get("/name/:name", requireAuth, requireAdmin, controller.getUsersByName);
router.get("/email/:email", requireAuth, requireAdmin, controller.getUserByEmail);

/** POST */
router.post("/logout/:uid", requireAuth, assertSelf(), controller.logout);
router.post("/resetPassword", requireAuth, controller.resetPassword);
router.post("/:uid/progress", requireAuth, assertSelf(), controller.saveChapterProgress);

/** PUT */
router.put("/", requireAuth, controller.updateUser);

/** Friends */
// router.get("/:uid/friends", requireAuth, controller.getFriends);
// router.get("/:uid/friends/ranking", requireAuth, controller.getFriendsRanking);
// router.post("/:uid/friends/:targetUid", requireAuth, controller.addFriend);
// router.put("/:uid/friends/:targetUid/accept", requireAuth, controller.acceptFriend);
// router.delete("/:uid/friends/:targetUid", requireAuth, controller.removeFriend);

/** Achievements */
router.post("/:uid/achievements/award", requireAuth, assertSelf(), controller.awardAchievement);

/** Email notifications */
router.post("/notify/new-challenge", requireAuth, controller.notifyNewChallenge);

/** Delete */
router.delete("/:uid", requireAuth, assertSelf(), controller.deleteUser);

export default router;
