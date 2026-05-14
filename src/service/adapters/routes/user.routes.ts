import { Router } from "express";
import * as controller from "../controller/user.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// ── Public routes (no auth required) ──────────────────────────
// router.post("/auth/", (req, res) => { controller.loginWithEmail(req, res); });
router.post("/auth/oauth", (req, res) => { controller.loginWithOAuth(req, res); });
// router.post("/", (req, res) => { controller.addUser(req, res); }); // disabled — sign-up only via OAuth

// ── Protected routes (auth required) ──────────────────────────

/** GET */
router.get("/top", requireAuth, (req, res) => { controller.getTopByXP(req, res); });
router.get("/", requireAuth, (req, res) => { controller.getAll(req, res); });
router.get("/uid/:uid", requireAuth, (req, res) => { controller.getUserByUID(req, res); });
router.get("/name/:name", requireAuth, (req, res) => { controller.getUsersByName(req, res); });
router.get("/email/:email", requireAuth, (req, res) => { controller.getUserByEmail(req, res); });

/** POST */
router.post("/logout/:uid", requireAuth, (req, res) => { controller.logout(req, res); });
router.post("/resetPassword", requireAuth, (req, res) => { controller.resetPassword(req, res); });
router.post("/:uid/progress", requireAuth, (req, res) => { controller.saveChapterProgress(req, res); });

/** PUT */
router.put("/", requireAuth, (req, res) => { controller.updateUser(req, res); });

/** Friends */
router.get("/:uid/friends", requireAuth, (req, res) => { controller.getFriends(req, res); });
router.get("/:uid/friends/ranking", requireAuth, (req, res) => { controller.getFriendsRanking(req, res); });
router.post("/:uid/friends/:targetUid", requireAuth, (req, res) => { controller.addFriend(req, res); });
router.put("/:uid/friends/:targetUid/accept", requireAuth, (req, res) => { controller.acceptFriend(req, res); });
router.delete("/:uid/friends/:targetUid", requireAuth, (req, res) => { controller.removeFriend(req, res); });

/** Achievements */
router.post("/:uid/achievements/award", requireAuth, (req, res) => { controller.awardAchievement(req, res); });

/** Email notifications */
router.post("/notify/new-challenge", requireAuth, (req, res) => { controller.notifyNewChallenge(req, res); });

/** Delete */
router.delete("/:uid", requireAuth, (req, res) => { controller.deleteUser(req, res); });

export default router;
