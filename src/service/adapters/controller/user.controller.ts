import { Request, Response } from "express";
import { UserUseCase } from "../../core/useCases/user.useCase";
import { UserFirebaseRepository } from "../repository/firebase/user.firebase.repository";
import { IUserView } from "../../core/domain/user.entity";
import { sendEmail } from "../email/email.service";
import { newChallengeTemplate } from "../email/newChallengeTemplate";
import { asyncHandler } from "../middleware/asyncHandler";
import { NotFoundError, ValidationError, ForbiddenError, UnauthorizedError } from "../errors/api-errors";
import {
	loginWithOAuthSchema,
	resetPasswordSchema,
	saveChapterProgressSchema,
	updateUserSchema,
	awardAchievementSchema,
	notifyNewChallengeSchema,
} from "../validation/schemas";

const userUseCase = new UserUseCase(new UserFirebaseRepository());

function getAuthUid(req: Request): string {
	if (!req.user?.uid) throw new UnauthorizedError("Usuário não autenticado.");
	return req.user.uid;
}

// GET
export const getTopByXP = asyncHandler(async (req: Request, res: Response) => {
	const limit = req.query.limit ? Number(req.query.limit) : 20;
	if (isNaN(limit) || limit < 1) throw new ValidationError("limit deve ser um número positivo.");

	const data = await userUseCase.getTopByXP(limit);
	res.status(200).json({ data });
});

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
	const data = await userUseCase.getAll();
	res.status(200).json({ data });
});

export const verifyToken = asyncHandler(async (req: Request, res: Response) => {
	const uid = getAuthUid(req);
	const user = await userUseCase.getUserByUID(uid);
	res.status(200).json({ data: user });
});

export const getUserByUID = asyncHandler(async (req: Request, res: Response) => {
	const uid = req.params.uid;
	const data = await userUseCase.getUserByUID(uid);
	if (!data) throw new NotFoundError("Usuário não encontrado.");
	res.status(200).json({ data });
});

export const getUsersByName = asyncHandler(async (req: Request, res: Response) => {
	const name = req.params.name;
	const data = await userUseCase.getUsersByName(name);
	res.status(200).json({ data });
});

export const getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
	const email = req.params.email;
	const data = await userUseCase.getUserByEmail(email);
	if (!data) throw new NotFoundError("Usuário não encontrado.");
	res.status(200).json({ data });
});

// POST
export const loginWithOAuth = asyncHandler(async (req: Request, res: Response) => {
	const { idToken, displayName, photoURL } = loginWithOAuthSchema.parse(req.body);
	const user = await userUseCase.loginWithOAuth(idToken, displayName, photoURL);
	res.status(200).json({ data: user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
	const uid = req.params.uid;
	await userUseCase.logout(uid);
	res.status(201).json();
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
	const { uid, newPassword } = resetPasswordSchema.parse(req.body);
	const authUid = getAuthUid(req);
	if (uid !== authUid) throw new ForbiddenError("Você só pode redefinir sua própria senha.");
	await userUseCase.resetPassword(uid, newPassword);
	res.status(200).json({ data: { ok: true } });
});

// PUT
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
	const user = updateUserSchema.parse(req.body);
	if (user.uid && user.uid !== getAuthUid(req)) {
		throw new ForbiddenError("Você só pode alterar seu próprio perfil.");
	}
	const updatedUser = await userUseCase.updateUser(user as Partial<IUserView>);
	res.status(200).json({ data: updatedUser });
});

// POST /api/user/:uid/progress
export const saveChapterProgress = asyncHandler(async (req: Request, res: Response) => {
	const { uid } = req.params;
	const body = saveChapterProgressSchema.parse(req.body);
	await userUseCase.saveChapterProgress(uid, {
		desafioId: String(body.desafioId),
		nameChallenge: body.nameChallenge,
		capFinish: Number(body.capFinish),
		xpObtido: Number(body.xpObtido),
		tempoSegundos: Number(body.tempoSegundos),
		totalQueries: body.totalQueries != null ? Number(body.totalQueries) : 0,
		totalHints: body.totalHints != null ? Number(body.totalHints) : 0,
	});
	res.status(200).json({ data: { ok: true } });
});

// DELETE
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
	const uid = req.params.uid;
	await userUseCase.deleteUser(uid);
	res.status(204).send();
});

// ── Friends ────────────────────────────────────────────────

export const addFriend = asyncHandler(async (req: Request, res: Response) => {
	const { uid, targetUid } = req.params;
	await userUseCase.addFriend(uid, targetUid);
	res.status(200).json({ data: { ok: true } });
});

export const acceptFriend = asyncHandler(async (req: Request, res: Response) => {
	const { uid, targetUid } = req.params;
	await userUseCase.acceptFriend(uid, targetUid);
	res.status(200).json({ data: { ok: true } });
});

export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
	const { uid, targetUid } = req.params;
	await userUseCase.removeFriend(uid, targetUid);
	res.status(200).json({ data: { ok: true } });
});

export const getFriends = asyncHandler(async (req: Request, res: Response) => {
	const { uid } = req.params;
	const friends = await userUseCase.getFriends(uid);
	res.status(200).json({ data: friends });
});

export const getFriendsRanking = asyncHandler(async (req: Request, res: Response) => {
	const { uid } = req.params;
	const ranking = await userUseCase.getFriendsRanking(uid);
	res.status(200).json({ data: ranking });
});

// ── Email notifications ────────────────────────────────────

export const notifyNewChallenge = asyncHandler(async (req: Request, res: Response) => {
	const { gameName, totalXP } = notifyNewChallengeSchema.parse(req.body);

	const siteUrl = process.env.SITE_URL ?? "https://apihub-macedo.duckdns.org/sql-challenge";
	const allUsers = await userUseCase.getAll();
	const targets = allUsers.filter((u: any) => u.emailNotifications === true && u.email);

	const results = await Promise.allSettled(
		targets.map((u: IUserView) => {
			const { subject, html } = newChallengeTemplate({
				userName: u.nick || u.username,
				gameName,
				totalXP: Number(totalXP),
				siteUrl,
			});
			return sendEmail(u.email, subject, html);
		})
	);

	const sent = results.filter(r => r.status === "fulfilled").length;
	const failed = results.filter(r => r.status === "rejected").length;

	res.status(200).json({ data: { sent, failed, total: targets.length } });
});

// ── Achievements ───────────────────────────────────────────

export const awardAchievement = asyncHandler(async (req: Request, res: Response) => {
	const { uid } = req.params;
	const { achievementId, xpBonus } = awardAchievementSchema.parse(req.body);
	const awarded = await userUseCase.awardAchievement(uid, achievementId, Number(xpBonus));
	res.status(200).json({ data: { awarded } });
});
