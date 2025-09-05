import { Router } from "express";
import * as controller from "../controller/user.controller";

const router = Router();

router.get("/", (req, res) => {controller.getAll(req, res)});
router.get("/uid/:uid", (req, res) => {controller.getUserByUID(req, res)});
router.get("/name/:name", (req, res) => {controller.getUsersByName(req, res)});
router.get("/email/:email", (req, res) => {controller.getUserByEmail(req, res)});

router.post("/", (req, res) => {controller.addUser(req, res)});
router.post("/google/:token", (req, res) => {controller.addUserbyGoogle(req, res)});
router.post("/auth/", (req, res) => {controller.loginWithEmail(req, res)});
router.post("/auth/google/:token", (req, res) => {controller.loginWithGoogle(req, res)});

router.put("/", (req, res) => {controller.updateUser(req, res)});

router.delete("/:uid", (req, res) => {controller.deleteUser(req, res)});

export default router;
