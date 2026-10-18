import { z } from "zod";

export const loginWithOAuthSchema = z.object({
	idToken: z.string().min(1, "idToken é obrigatório"),
	displayName: z.string().optional(),
	photoURL: z.string().optional(),
});

export const resetPasswordSchema = z.object({
	uid: z.string().min(1, "uid é obrigatório"),
	newPassword: z.string().min(6, "newPassword deve ter no mínimo 6 caracteres"),
});

export const saveChapterProgressSchema = z.object({
	desafioId: z.union([z.string(), z.number()]),
	nameChallenge: z.string().min(1, "nameChallenge é obrigatório"),
	capFinish: z.union([z.number(), z.boolean()]),
	xpObtido: z.number(),
	tempoSegundos: z.number(),
	totalQueries: z.number().optional(),
	totalHints: z.number().optional(),
});

// Só campos de perfil auto-editáveis. xp / rankingPosition / challenge_progress /
// friends / awardedAchievements são calculados pelo servidor (progresso, conquistas)
// e NUNCA podem ser gravados pelo cliente — evita auto-atribuição de XP.
export const updateUserSchema = z.object({
	uid: z.string().min(1).optional(),
	username: z.string().min(1).optional(),
	nick: z.string().optional(),
	fotoPerfil: z.string().optional(),
	imagePerfil: z.string().optional(),
	emailNotifications: z.boolean().optional(),
});

export const awardAchievementSchema = z.object({
	achievementId: z.string().min(1, "achievementId é obrigatório"),
	xpBonus: z.number().min(0, "xpBonus deve ser maior ou igual a zero"),
});

export const notifyNewChallengeSchema = z.object({
	gameName: z.string().min(1, "gameName é obrigatório"),
	totalXP: z.number().min(0, "totalXP deve ser maior ou igual a zero"),
});

export const saveSessionSchema = z.object({
	elapsedSeconds: z.number().min(0),
	currentObjetivoIndex: z.number().min(0),
	completedObjetivos: z.array(z.number()),
	hintsRevealed: z.array(z.number()),
	isClosing: z.boolean(),
});

// ── Eventos (telemetria) ───────────────────────────────────────
// Lote de até 25 eventos; payload por tipo é discriminado via `type`.
// O uid NUNCA vem do body — é extraído do token no controller.

const eventBase = {
	desafioId: z.string().min(1).max(64),
	capituloId: z.number().int().min(0),
	clientTs: z.number().optional(),
};

export const eventBatchSchema = z.object({
	events: z
		.array(
			z.discriminatedUnion("type", [
				z.object({ type: z.literal("session_start"), ...eventBase, payload: z.record(z.string(), z.unknown()).optional() }),
				z.object({ type: z.literal("session_end"), ...eventBase, payload: z.object({ seconds: z.number() }) }),
				z.object({
					type: z.literal("query_run"),
					...eventBase,
					payload: z.object({
						sql: z.string().max(200),
						ok: z.boolean(),
						durationMs: z.number().optional(),
						rowCount: z.number().optional(),
					}),
				}),
				z.object({
					type: z.literal("sql_error"),
					...eventBase,
					payload: z.object({ sql: z.string().max(200), message: z.string().max(300) }),
				}),
				z.object({ type: z.literal("hint_revealed"), ...eventBase, payload: z.object({ hintId: z.number().int() }) }),
				z.object({
					type: z.literal("objetivo_completed"),
					...eventBase,
					payload: z.object({ objetivoId: z.number().int(), index: z.number().int().min(0), secondsElapsed: z.number() }),
				}),
				z.object({
					type: z.literal("chapter_victory"),
					...eventBase,
					payload: z.object({
						tier: z.string().max(20),
						xp: z.number(),
						hintsUsed: z.number().int(),
						totalSeconds: z.number(),
					}),
				}),
			])
		)
		.max(25),
});

export const addRankingSchema = z.object({
	username: z.string().min(1),
	nick: z.string().min(1),
	imagePerfil: z.string().optional(),
	rankingPosition: z.number().min(0),
});

export const updateRankingImageSchema = z.object({
	newImage: z.string().min(1, "newImage é obrigatório"),
});
