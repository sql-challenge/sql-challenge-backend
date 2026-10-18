export type SecurityFlagType =
	| "xp_over_max"
	| "xp_without_progress"
	| "chapter_jump"
	| "zero_query_victory"
	| "time_over_wallclock"
	| "achievement_burst";

/** Chaves estáveis para lookup no dashboard. */
export const FLAG_TYPE = {
	XP_OVER_MAX: "xp_over_max",
	XP_WITHOUT_PROGRESS: "xp_without_progress",
	CHAPTER_JUMP: "chapter_jump",
	ZERO_QUERY_VICTORY: "zero_query_victory",
	TIME_OVER_WALLCLOCK: "time_over_wallclock",
	ACHIEVEMENT_BURST: "achievement_burst",
} as const satisfies Record<string, SecurityFlagType>;

export interface SecurityFlag {
	uid: string;
	type: SecurityFlagType;
	/** Descrição legível do motivo (com os números comparados). */
	detail: string;
	desafioId: string;
	capituloId: number;
	serverTs: Date;
}

export interface SecurityFlagDoc extends SecurityFlag {
	id: string;
}

export const FLAG_LABELS: Record<SecurityFlagType, string> = {
	xp_over_max: "XP acima do máximo possível",
	xp_without_progress: "XP sem avanço de capítulo",
	chapter_jump: "Pulo de capítulos",
	zero_query_victory: "Vitória sem queries",
	time_over_wallclock: "Tempo acima do relógio do servidor",
	achievement_burst: "Rajada de conquistas",
};
