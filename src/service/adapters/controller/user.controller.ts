import { Request, Response } from "express";
import { UserUseCase } from "../../core/useCases/user.useCase";
import { UserFirebaseRepository } from "../repository/firebase/user.firebase.repository";
import { ApiResponse } from "../../core/domain/http.entity";
import { IUserView } from "../../core/domain/user.entity";
import { sendEmail } from "../email/email.service";
import { newChallengeTemplate } from "../email/newChallengeTemplate";
// eslint-disable-next-line @typescript-eslint/no-require-imports
// Resend removido — usando Nodemailer + Gmail

const userUseCase = new UserUseCase(new UserFirebaseRepository());

// GET
export const getTopByXP = async (req: Request, res: Response) => {
	try {
		const limit = req.query.limit ? Number(req.query.limit) : 20;
		const data = await userUseCase.getTopByXP(limit);
		res.status(200).json({ data });
	} catch (error: unknown) {
		console.error(`[user.controller] getTopByXP:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await userUseCase.getAll();
		res.status(200).json({ data });
	} catch (error: unknown) {
		console.error(`[user.controller] getAll:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

/**
 * GET /api/user/token/valid
 * Validates the token and returns fresh user data.
 * Token already validated by requireAuth middleware.
 */
export const verifyToken = async (req: Request, res: Response) => {
	try {
		const uid = (req.user as any).uid
		const authHeader = req.headers.authorization;
		const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
		const user = await userUseCase.getUserByUID(uid, idToken)
		res.status(200).json({ data: user })
	} catch (error: unknown) {
		console.error(`[user.controller] verifyToken:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` })
	}
};

export const getUserByUID = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid;
		const authHeader = req.headers.authorization;
		const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
		const data = await userUseCase.getUserByUID(uid, idToken);
		res.status(200).json({ data });
	} catch (error: unknown) {
		console.error(`[user.controller] getUserByUID:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

export const getUsersByName = async (req: Request, res: Response) => {
	try {
		const name = req.params.name;
		const data = await userUseCase.getUsersByName(name);
		res.status(200).json({ data });
	} catch (error: unknown) {
		console.error(`[user.controller] getUsersByName:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

export const getUserByEmail = async (req: Request, res: Response) => {
	try {
		const email = req.params.email;
		const data = await userUseCase.getUserByEmail(email);
		res.status(200).json({ data });
	} catch (error: unknown) {
		console.error(`[user.controller] getUserByEmail:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// ⚠️ Disabled — sign-up only via OAuth
// export const addUser = async (req: Request, res: Response<ApiResponse<IUserView>>) => {
// 	try {
// 		const user = req.body;
// 		const newUser = await userUseCase.addUser(user);
// 		const body: ApiResponse<IUserView> = { data: newUser }
// 		res.status(201).json(body);
// 	} catch (error: unknown) {
// 		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
// 	}
// };

// export const addUserbyGoogle = async (req: Request, res: Response) => {
// 	try {
// 		const idToken = req.params.token
// 		const newUser = await userUseCase.addUserbyGoogle(idToken);
// 		res.status(201).json(newUser);
// 	} catch (error: unknown) {
// 		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
// 	}
// };

// ⚠️ Dead code — frontend usa /auth/oauth para todos os logins (incluindo email/senha).
// export const loginWithEmail = async (req: Request, res: Response) => {
// 	try {
// 		const body = req.body
// 		const newUser = await userUseCase.loginWithEmail(body.email, body.password);
// 		res.status(201).json({ data: newUser });
// 	} catch (error: unknown) {
// 		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
// 	}
// };

/**
 * POST /api/user/auth/oauth
 * Recebe um Firebase ID token (Google ou GitHub) e faz login/cadastro automático.
 * O Firebase valida a identidade — o backend nunca armazena senhas de provedores OAuth.
 */
export const loginWithOAuth = async (req: Request, res: Response) => {
	try {
		const { idToken, displayName, photoURL } = req.body;
		if (!idToken) {
			res.status(400).json({ error: "idToken é obrigatório." });
			return;
		}
		const user = await userUseCase.loginWithOAuth(idToken, displayName, photoURL);
		res.status(200).json({ data: user });
	} catch (error: unknown) {
		console.error(`[user.controller] loginWithOAuth:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid
		await userUseCase.logout(uid);
		res.status(201).json();
	} catch (error: unknown) {
		console.error(`[user.controller] logout:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { uid, newPassword } = req.body;
		if (!uid || !newPassword) {
			res.status(400).json({ error: "uid e newPassword são obrigatórios no corpo da requisição." });
			return;
		}
		await userUseCase.resetPassword(uid, newPassword);
		res.status(200).json({ data: { ok: true } });
	} catch (error: unknown) {
		console.error(`[user.controller] resetPassword:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// PUT
export const updateUser = async (req: Request, res: Response) => {
	try {
		const user = req.body;
		const authHeader = req.headers.authorization;
		const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
		const updatedUser = await userUseCase.updateUser(user, idToken);
		res.status(200).json({ data: updatedUser });
	} catch (error: unknown) {
		console.error(`[user.controller] updateUser:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// POST /api/user/:uid/progress
export const saveChapterProgress = async (req: Request, res: Response) => {
	try {
		const { uid } = req.params;
		const { desafioId, nameChallenge, capFinish, xpObtido, tempoSegundos, totalQueries, totalHints } = req.body;
		if (!desafioId || !nameChallenge || capFinish == null || xpObtido == null || tempoSegundos == null) {
			res.status(400).json({ error: "Campos obrigatórios: desafioId, nameChallenge, capFinish, xpObtido, tempoSegundos." });
			return;
		}
		await userUseCase.saveChapterProgress(uid, {
			desafioId: String(desafioId),
			nameChallenge,
			capFinish: Number(capFinish),
			xpObtido: Number(xpObtido),
			tempoSegundos: Number(tempoSegundos),
			totalQueries: totalQueries != null ? Number(totalQueries) : 0,
			totalHints: totalHints != null ? Number(totalHints) : 0,
		});
		res.status(200).json({ data: { ok: true } });
	} catch (error: unknown) {
		console.error(`[user.controller] saveChapterProgress:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid;
		await userUseCase.deleteUser(uid);
		res.status(204).send();
	} catch (error: unknown) {
		console.error(`[user.controller] deleteUser:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// ── Friends ────────────────────────────────────────────────

export const addFriend = async (req: Request, res: Response) => {
	try {
		const { uid, targetUid } = req.params;
		await userUseCase.addFriend(uid, targetUid);
		res.status(200).json({ data: { ok: true } });
	} catch (error: unknown) {
		console.error(`[user.controller] addFriend:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		const msg = error instanceof Error ? error.message : "Unknown error";
		if (msg.includes("Já são amigos")) {
			res.status(409).json({ error: "Já são amigos ou solicitação pendente." });
		} else if (msg.includes("User not found")) {
			res.status(404).json({ error: "Usuário não encontrado." });
		} else {
			res.status(400).json({ error: msg });
		}
	}
};

export const acceptFriend = async (req: Request, res: Response) => {
	try {
		const { uid, targetUid } = req.params;
		await userUseCase.acceptFriend(uid, targetUid);
		res.status(200).json({ data: { ok: true } });
	} catch (error: unknown) {
		console.error(`[user.controller] acceptFriend:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		const msg = error instanceof Error ? error.message : "Unknown error";
		if (msg.includes("User not found")) {
			res.status(404).json({ error: "Usuário não encontrado." });
		} else {
			res.status(400).json({ error: msg });
		}
	}
};

export const removeFriend = async (req: Request, res: Response) => {
	try {
		const { uid, targetUid } = req.params;
		await userUseCase.removeFriend(uid, targetUid);
		res.status(200).json({ data: { ok: true } });
	} catch (error: unknown) {
		console.error(`[user.controller] removeFriend:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		const msg = error instanceof Error ? error.message : "Unknown error";
		if (msg.includes("User not found")) {
			res.status(404).json({ error: "Usuário não encontrado." });
		} else {
			res.status(400).json({ error: msg });
		}
	}
};

export const getFriends = async (req: Request, res: Response) => {
	try {
		const { uid } = req.params;
		const authHeader = req.headers.authorization;
		const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
		const friends = await userUseCase.getFriends(uid, idToken);
		res.status(200).json({ data: friends });
	} catch (error: unknown) {
		console.error(`[user.controller] getFriends:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

export const getFriendsRanking = async (req: Request, res: Response) => {
	try {
		const { uid } = req.params;
		const ranking = await userUseCase.getFriendsRanking(uid);
		res.status(200).json({ data: ranking });
	} catch (error: unknown) {
		console.error(`[user.controller] getFriendsRanking:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// ── Achievements ───────────────────────────────────────────

// ── Email notifications ────────────────────────────────────

/**
 * POST /api/user/notify/new-challenge
 * Body: { gameName: string, totalXP: number }
 * Envia e-mail para todos os usuários com emailNotifications: true.
 */
export const notifyNewChallenge = async (req: Request, res: Response) => {
	try {
		const { gameName, totalXP } = req.body;
		if (!gameName || totalXP == null) {
			res.status(400).json({ error: "gameName e totalXP são obrigatórios." });
			return;
		}

		const siteUrl = process.env.SITE_URL ?? "https://apihub-macedo.duckdns.org/sql-challenge";
		const allUsers = await userUseCase.getAll();
		const targets  = allUsers.filter((u: any) => u.emailNotifications === true && u.email);

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

		const sent   = results.filter(r => r.status === "fulfilled").length;
		const failed = results.filter(r => r.status === "rejected").length;

		res.status(200).json({ data: { sent, failed, total: targets.length } });
	} catch (error: unknown) {
		console.error(`[user.controller] notifyNewChallenge:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

export const awardAchievement = async (req: Request, res: Response) => {
	try {
		const { uid } = req.params;
		const { achievementId, xpBonus } = req.body;
		if (!achievementId || xpBonus == null) {
			res.status(400).json({ error: "achievementId e xpBonus são obrigatórios." });
			return;
		}
		const awarded = await userUseCase.awardAchievement(uid, achievementId, Number(xpBonus));
		res.status(200).json({ data: { awarded } });
	} catch (error: unknown) {
		console.error(`[user.controller] awardAchievement:`, (error as Error).name, (error as Error).message, (error as any)?.code, (error as Error).stack);
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};
