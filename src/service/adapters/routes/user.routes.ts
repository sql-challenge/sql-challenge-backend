import { Router } from "express";
import * as controller from "../controller/user.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// ── Public routes (no auth required) ──────────────────────────
router.post("/auth/oauth", controller.loginWithOAuth);

// ── Protected routes (auth required) ──────────────────────────

/** GET */
router.get("/top", controller.getTopByXP);
router.get("/token/valid", requireAuth, controller.verifyToken);
router.get("/", requireAuth, controller.getAll);
router.get("/uid/:uid", requireAuth, controller.getUserByUID);
router.get("/name/:name", requireAuth, controller.getUsersByName);
router.get("/email/:email", requireAuth, controller.getUserByEmail);

/** POST */
router.post("/logout/:uid", requireAuth, controller.logout);
router.post("/resetPassword", requireAuth, controller.resetPassword);
router.post("/:uid/progress", requireAuth, controller.saveChapterProgress);

/** PUT */
router.put("/", requireAuth, controller.updateUser);

/** Friends */
// router.get("/:uid/friends", requireAuth, controller.getFriends);
// router.get("/:uid/friends/ranking", requireAuth, controller.getFriendsRanking);
// router.post("/:uid/friends/:targetUid", requireAuth, controller.addFriend);
// router.put("/:uid/friends/:targetUid/accept", requireAuth, controller.acceptFriend);
// router.delete("/:uid/friends/:targetUid", requireAuth, controller.removeFriend);

/** Achievements */
router.post("/:uid/achievements/award", requireAuth, controller.awardAchievement);

/** Email notifications */
router.post("/notify/new-challenge", requireAuth, controller.notifyNewChallenge);

/** Delete */
router.delete("/:uid", requireAuth, controller.deleteUser);

export default router;
