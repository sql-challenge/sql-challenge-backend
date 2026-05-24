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

export const updateUserSchema = z.object({
	uid: z.string().min(1).optional(),
	username: z.string().min(1).optional(),
	nick: z.string().optional(),
	email: z.string().email().optional(),
	xp: z.number().optional(),
	fotoPerfil: z.string().optional(),
	imagePerfil: z.string().optional(),
	rankingPosition: z.number().optional(),
	challenge_progress: z.array(z.any()).optional(),
	friends: z.array(z.any()).optional(),
	awardedAchievements: z.array(z.string()).optional(),
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

export const addRankingSchema = z.object({
	username: z.string().min(1),
	nick: z.string().min(1),
	imagePerfil: z.string().optional(),
	rankingPosition: z.number().min(0),
});

export const updateRankingImageSchema = z.object({
	newImage: z.string().min(1, "newImage é obrigatório"),
});
