import { Router } from "express";
import * as controller from "../controller/user.controller";

const router = Router();
/** GET */
router.get("/top", (req, res) => {controller.getTopByXP(req, res)});
router.get("/", (req, res) => {controller.getAll(req, res)});
router.get("/uid/:uid", (req, res) => {controller.getUserByUID(req, res)});
router.get("/name/:name", (req, res) => {controller.getUsersByName(req, res)});
router.get("/email/:email", (req, res) => {controller.getUserByEmail(req, res)});
/** POST */
router.post("/", (req, res) => {controller.addUser(req, res)});
// router.post("/google/:token", (req, res) => {controller.addUserbyGoogle(req, res)});
router.post("/auth/", (req, res) => {controller.loginWithEmail(req, res)});
router.post("/auth/oauth", (req, res) => {controller.loginWithOAuth(req, res)});
// router.post("/auth/google/:token", (req, res) => {controller.loginWithGoogle(req, res)});
router.post("/logout/:uid", (req, res) => {controller.logout(req, res)});
router.post("/resetPassword/:uid/:newPsw", (req, res) => {controller.resetPassword(req, res)});
router.post("/:uid/progress", (req, res) => {controller.saveChapterProgress(req, res)});
/** PUT */
router.put("/", (req, res) => {controller.updateUser(req, res)});
/** Friends */
router.get("/:uid/friends", (req, res) => {controller.getFriends(req, res)});
router.get("/:uid/friends/ranking", (req, res) => {controller.getFriendsRanking(req, res)});
router.post("/:uid/friends/:targetUid", (req, res) => {controller.addFriend(req, res)});
router.put("/:uid/friends/:targetUid/accept", (req, res) => {controller.acceptFriend(req, res)});
router.delete("/:uid/friends/:targetUid", (req, res) => {controller.removeFriend(req, res)});
/** Achievements */
router.post("/:uid/achievements/award", (req, res) => {controller.awardAchievement(req, res)});
/** delete */
router.delete("/:uid", (req, res) => {controller.deleteUser(req, res)});

export default router;
