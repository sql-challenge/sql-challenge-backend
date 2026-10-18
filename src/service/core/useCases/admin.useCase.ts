import { IUserPort } from "../ports/user.port";
import { ChapterSession } from "../domain/chapter-session.entity";
import { SecurityFlagDoc } from "../domain/security-flag.entity";
import { StudentEventDoc } from "../../adapters/repository/firebase/admin.firebase.repository";

export interface IAdminReader {
	listChapterSessions(uid: string, desafioId?: string): Promise<ChapterSession[]>;
	listStudentEvents(uid: string, opts?: { desafioId?: string; limit?: number }): Promise<StudentEventDoc[]>;
	listFlags(desafioId?: string): Promise<SecurityFlagDoc[]>;
}

export interface AdminSessionBrief {
	capituloId: number;
	desafioId: string;
	currentObjetivoIndex: number;
	completedCount: number;
	totalSeconds: number;
	isActive: boolean;
	firstStartedAt: Date | null;
	lastActivityAt: Date | null;
}

export interface AdminStudentOverview {
	uid: string;
	username: string;
	nick: string;
	email: string;
	xp: number;
	lastLogin: Date | null;
	// Agregados de progresso (challenge_progress do desafio, ou soma de todos)
	capFinish: number;
	xpObtido: number;
	totalQueries: number;
	totalHints: number;
	tempoSegundos: number;
	// Ciclo de sessão (somatório/min/max nas sessões do escopo)
	sessionCount: number;
	firstStartedAt: Date | null;
	lastActivityAt: Date | null;
	// Detalhe por capítulo — alimenta a visão "agora / travado em"
	sessions: AdminSessionBrief[];
}

export class AdminUseCase {
	constructor(
		private userPort: IUserPort,
		private reader: IAdminReader,
	) {}

	/**
	 * Visão por aluno: progresso agregado do desafio (ou de todos) +
	 * ciclo de sessão (quantas vezes abriu, primeira/última atividade).
	 */
	async getOverview(desafioId?: string): Promise<AdminStudentOverview[]> {
		const users = await this.userPort.getAll();

		return Promise.all(
			users.map(async (u) => {
				const progressList = desafioId
					? u.challenge_progress.filter((p) => p.nameChallenge === desafioId)
					: u.challenge_progress;

				const capFinish = progressList.reduce((a, p) => Math.max(a, p.capFinish ?? 0), 0);
				const xpObtido = progressList.reduce((a, p) => a + (p.xpObtido ?? 0), 0);
				const totalQueries = progressList.reduce((a, p) => a + (p.totalQueries ?? 0), 0);
				const totalHints = progressList.reduce((a, p) => a + (p.totalHints ?? 0), 0);
				const tempoSegundos = progressList.reduce((a, p) => a + (p.totalSeconds ?? 0), 0);

				const sessions = await this.reader.listChapterSessions(u.uid, desafioId);
				const sessionCount = sessions.reduce((a, s) => a + (s.sessionCount ?? 0), 0);
				const firstStartedAt = sessions
					.map((s) => s.firstStartedAt)
					.filter((d): d is Date => !!d)
					.reduce<Date | null>((min, d) => (min === null || d < min ? d : min), null);
				const lastActivityAt = sessions
					.map((s) => s.lastActivityAt ?? s.lastStartedAt)
					.filter((d): d is Date => !!d)
					.reduce<Date | null>((max, d) => (max === null || d > max ? d : max), null);

				return {
					uid: u.uid,
					username: u.username,
					nick: u.nick,
					email: u.email,
					xp: u.xp ?? 0,
					lastLogin: u.lastLogin ?? null,
					capFinish,
					xpObtido,
					totalQueries,
					totalHints,
					tempoSegundos,
					sessionCount,
					firstStartedAt,
					lastActivityAt,
					sessions: sessions.map((s) => ({
						capituloId: s.capituloId,
						desafioId: s.desafioId,
						currentObjetivoIndex: s.currentObjetivoIndex,
						completedCount: Array.isArray(s.completedObjetivos) ? s.completedObjetivos.length : 0,
						totalSeconds: s.totalSeconds,
						isActive: s.isActive,
						firstStartedAt: s.firstStartedAt,
						lastActivityAt: s.lastActivityAt ?? s.lastStartedAt,
					})),
				};
			})
		);
	}

	/** Timeline de eventos de um aluno (drill-down no dashboard). */
	async getStudentEvents(uid: string, opts?: { desafioId?: string; limit?: number }): Promise<StudentEventDoc[]> {
		return this.reader.listStudentEvents(uid, opts);
	}

	/** Flags de atividade suspeita (auditoria anti-forgery). */
	async getFlags(desafioId?: string): Promise<SecurityFlagDoc[]> {
		return this.reader.listFlags(desafioId);
	}
}
