import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../db/firebase/firebaseAdminConfig";
import { ChapterSession } from "../../../core/domain/chapter-session.entity";
import { IAdminReader } from "../../../core/useCases/admin.useCase";
import { SecurityFlagFirebaseRepository } from "./security-flag.firebase.repository";
import { SecurityFlagDoc } from "../../../core/domain/security-flag.entity";

/**
 * Read-model do dashboard do professor. Lê direto as subcoleções de
 * sessão de cada usuário — não implementa IChapterSessionPort porque é
 * uma visão agregada, não o fluxo de sessão do jogador.
 */
export class AdminFirebaseRepository implements IAdminReader {

	private flagRepo = new SecurityFlagFirebaseRepository();

	/** Flags de atividade suspeita (delegação). */
	async listFlags(desafioId?: string): Promise<SecurityFlagDoc[]> {
		return this.flagRepo.listByDesafio(desafioId);
	}

	/** Sessões de capítulo de um usuário (do desafio, ou todas se desafioId omitido). */
	async listChapterSessions(uid: string, desafioId?: string): Promise<ChapterSession[]> {
		let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
			this.userDoc(uid).collection("chapter_sessions");
		if (desafioId) {
			query = query.where("desafio_id", "==", desafioId);
		}

		const snap = await query.get();
		return snap.docs.map((doc) => {
			const d = doc.data();
			return {
				uid,
				desafioId: (d.desafio_id as string) ?? "",
				capituloId: (d.capitulo_id as number) ?? 0,
				totalSeconds: (d.total_seconds as number) ?? 0,
				lastStartedAt: d.last_started_at ? (d.last_started_at as Timestamp).toDate() : null,
				isActive: (d.is_active as boolean) ?? false,
				currentObjetivoIndex: (d.current_objetivo_index as number) ?? 0,
				completedObjetivos: (d.completed_objetivos as number[]) ?? [],
				hintsRevealed: (d.hints_revealed as number[]) ?? [],
				firstStartedAt: d.first_started_at ? (d.first_started_at as Timestamp).toDate() : null,
				lastActivityAt: d.last_activity_at ? (d.last_activity_at as Timestamp).toDate() : null,
				sessionCount: (d.session_count as number) ?? 0,
			};
		});
	}

	/**
	 * Timeline de eventos de um aluno (coleção top-level `events`).
	 * where(uid) usa o índice single-field automático; ordenação e filtro
	 * de desafio em memória — evita exigir índice composto.
	 */
	async listStudentEvents(uid: string, opts?: { desafioId?: string; limit?: number }): Promise<StudentEventDoc[]> {
		const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 200);

		const snap = await db.collection("events")
			.where("uid", "==", uid)
			.limit(500)
			.get();

		let events: StudentEventDoc[] = snap.docs.map((doc) => {
			const d = doc.data();
			return {
				id: doc.id,
				type: (d.type as string) ?? "",
				desafioId: (d.desafio_id as string) ?? "",
				capituloId: (d.capitulo_id as number) ?? 0,
				classCode: (d.class_code as string | null) ?? null,
				payload: (d.payload as Record<string, unknown>) ?? {},
				clientTs: d.client_ts ? (d.client_ts as Timestamp).toDate() : null,
				serverTs: d.server_ts ? (d.server_ts as Timestamp).toDate() : new Date(0),
			};
		});

		if (opts?.desafioId) {
			events = events.filter((e) => e.desafioId === opts.desafioId);
		}
		events.sort((a, b) => b.serverTs.getTime() - a.serverTs.getTime());

		return events.slice(0, limit);
	}

	private userDoc(uid: string) {
		return db.collection("User").doc(uid);
	}
}

export interface StudentEventDoc {
	id: string;
	type: string;
	desafioId: string;
	capituloId: number;
	classCode: string | null;
	payload: Record<string, unknown>;
	clientTs: Date | null;
	serverTs: Date;
}
