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
		const users = await userUseCase.getTopByXP(limit);
		res.status(200).json(users);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getAll = async (req: Request, res: Response) => {
	try {
		const users = await userUseCase.getAll();
		res.status(200).json(users);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getUserByUID = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid;
		const user = await userUseCase.getUserByUID(uid);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getUsersByName = async (req: Request, res: Response) => {
	try {
		const name = req.params.name;
		const users = await userUseCase.getUsersByName(name);
		res.status(200).json(users);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getUserByEmail = async (req: Request, res: Response) => {
	try {
		const email = req.params.email;
		const user = await userUseCase.getUserByEmail(email);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// POST
export const addUser = async (req: Request, res: Response<ApiResponse<IUserView>>) => {
	try {
		const user = req.body;
		const newUser = await userUseCase.addUser(user);
		//
		const body: ApiResponse<IUserView> = { data: newUser }
		//
		res.status(201).json(body);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// export const addUserbyGoogle = async (req: Request, res: Response) => {
// 	try {
// 		const idToken = req.params.token
// 		const newUser = await userUseCase.addUserbyGoogle(idToken);
// 		res.status(201).json(newUser);
// 	} catch (error: any) {
// 		res.status(500).json({ error: error.message });
// 	}
// };

export const loginWithEmail = async (req: Request, res: Response) => {
	try {
		const body = req.body
		const newUser = await userUseCase.loginWithEmail(body.email, body.password);
		res.status(201).json({ data: newUser });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const loginWithGoogle = async (req: Request, res: Response) => {
	try {
		const idToken = req.params.token
		const newUser = await userUseCase.loginWithGoogle(idToken);
		res.status(201).json({ data: newUser });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

/**
 * POST /api/user/auth/oauth
 * Recebe um Firebase ID token (Google ou GitHub) e faz login/cadastro automático.
 * O Firebase valida a identidade — o backend nunca armazena senhas de provedores OAuth.
 */
export const loginWithOAuth = async (req: Request, res: Response) => {
	try {
		const { idToken } = req.body;
		if (!idToken) {
			res.status(400).json({ error: "idToken é obrigatório." });
			return;
		}
		const user = await userUseCase.loginWithOAuth(idToken);
		res.status(200).json({ data: user });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid
		await userUseCase.logout(uid);
		res.status(201).json();
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid
		const newPsw = req.params.newPsw
		await userUseCase.resetPassword(uid, newPsw);
		res.status(201).json();
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// PUT
export const updateUser = async (req: Request, res: Response) => {
	try {
		const user = req.body;
		const updatedUser = await userUseCase.updateUser(user);
		res.status(200).json({ data: updatedUser });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// POST /api/user/:uid/progress
export const saveChapterProgress = async (req: Request, res: Response) => {
	try {
		const { uid } = req.params;
		const { desafioId, nameChallenge, capFinish, xpObtido, tempoSegundos } = req.body;
		if (!desafioId || !nameChallenge || capFinish == null || xpObtido == null || tempoSegundos == null) {
			res.status(400).json({ error: "Campos obrigatórios: desafioId, nameChallenge, capFinish, xpObtido, tempoSegundos." });
			return;
		}
		await userUseCase.saveChapterProgress(uid, { desafioId: String(desafioId), nameChallenge, capFinish: Number(capFinish), xpObtido: Number(xpObtido), tempoSegundos: Number(tempoSegundos) });
		res.status(200).json({ data: { ok: true } });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid;
		await userUseCase.deleteUser(uid);
		res.status(204).send();
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// ── Friends ────────────────────────────────────────────────

export const addFriend = async (req: Request, res: Response) => {
	try {
		const { uid, targetUid } = req.params;
		await userUseCase.addFriend(uid, targetUid);
		res.status(200).json({ data: { ok: true } });
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
};

export const acceptFriend = async (req: Request, res: Response) => {
	try {
		const { uid, targetUid } = req.params;
		await userUseCase.acceptFriend(uid, targetUid);
		res.status(200).json({ data: { ok: true } });
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
};

export const removeFriend = async (req: Request, res: Response) => {
	try {
		const { uid, targetUid } = req.params;
		await userUseCase.removeFriend(uid, targetUid);
		res.status(200).json({ data: { ok: true } });
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
};

export const getFriends = async (req: Request, res: Response) => {
	try {
		const { uid } = req.params;
		const friends = await userUseCase.getFriends(uid);
		res.status(200).json({ data: friends });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getFriendsRanking = async (req: Request, res: Response) => {
	try {
		const { uid } = req.params;
		const ranking = await userUseCase.getFriendsRanking(uid);
		res.status(200).json({ data: ranking });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
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
	} catch (error: any) {
		res.status(500).json({ error: error.message });
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
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
