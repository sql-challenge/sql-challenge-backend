import { Request, Response } from "express";
import { UserUseCase } from "../../core/useCases/user.useCase";
import { UserFirebaseRepository } from "../repository/firebase/user.firebase.repository";
import { SecurityFlagFirebaseRepository } from "../repository/firebase/security-flag.firebase.repository";
import { CapituloUseCase } from "../../core/useCases/capitulo.useCase";
import { CapituloPostgresRepository } from "../repository/postgres/gestao/capitulo.postgres.repository";
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

const flagPort = new SecurityFlagFirebaseRepository();
const userUseCase = new UserUseCase(new UserFirebaseRepository(flagPort));
const capituloUseCase = new CapituloUseCase(new CapituloPostgresRepository());

function getAuthUid(req: Request): string {
	if (!req.user?.uid) throw new UnauthorizedError("Usuário não autenticado.");
	return req.user.uid;
}

// ── GET ──────────────────────────────────────────────────────

/** Projeção segura do placar: só o que um ranking pode exibir.
 *  Nunca email / amigos / progresso / conquistas de terceiros. */
interface RankingEntryView {
	uid: string;
	username: string;
	nick: string;
	imagePerfil: string | null;
	rankingPosition: number;
	xp: number;
}

function toRankingEntry(u: IUserView): RankingEntryView {
	return {
		uid: u.uid,
		username: u.username,
		nick: u.nick,
		imagePerfil: u.imagePerfil ?? null,
		rankingPosition: u.rankingPosition ?? 0,
		xp: u.xp ?? 0,
	};
}

// GET
export const getTopByXP = asyncHandler(async (req: Request, res: Response) => {
	const limit = req.query.limit ? Number(req.query.limit) : 20;
	if (isNaN(limit) || limit < 1) throw new ValidationError("limit deve ser um número positivo.");

	const data = await userUseCase.getTopByXP(limit);
	res.status(200).json({ data: data.map(toRankingEntry) });
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
	const uid = getAuthUid(req);
	if (user.uid && user.uid !== uid) {
		throw new ForbiddenError("Você só pode alterar seu próprio perfil.");
	}
	// uid sempre vem do token — nunca confia no body
	const updatedUser = await userUseCase.updateUser({ ...user, uid });
	res.status(200).json({ data: updatedUser });
});

// POST /api/user/:uid/progress
export const saveChapterProgress = asyncHandler(async (req: Request, res: Response) => {
	const { uid } = req.params;
	const body = saveChapterProgressSchema.parse(req.body);
	const capFinish = Number(body.capFinish);

	// Teto plausível de XP do capítulo claimado (base do Postgres × 1.5 + margem)
	// alimenta o flag xp_over_max no repositório. Best-effort: Postgres fora
	// → flag desativado, gameplay segue.
	let maxXpAllowed: number | undefined;
	try {
		const capitulos = await capituloUseCase.getAll();
		const cap = capitulos.find(
			(c) => String(c.idDesafio) === String(body.desafioId) && c.numero === capFinish
		);
		if (cap) maxXpAllowed = Math.round(cap.xpRecompensa * 1.5) + 1;
	} catch (err) {
		console.error("[user.controller] baseXp lookup falhou (audit off):", err);
	}

	await userUseCase.saveChapterProgress(uid, {
		desafioId: String(body.desafioId),
		nameChallenge: body.nameChallenge,
		capFinish,
		xpObtido: Number(body.xpObtido),
		tempoSegundos: Number(body.tempoSegundos),
		totalQueries: body.totalQueries != null ? Number(body.totalQueries) : 0,
		totalHints: body.totalHints != null ? Number(body.totalHints) : 0,
		maxXpAllowed,
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

	const siteUrl = process.env.SITE_URL ?? "https://sql-challenge.atcfalcons.org/sql-challenge";
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
