import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../db/firebase/firebaseAdminConfig";
import { ChapterSession } from "../../../core/domain/chapter-session.entity";

/**
 * Read-model do dashboard do professor. Lê direto as subcoleções de
 * sessão de cada usuário — não implementa IChapterSessionPort porque é
 * uma visão agregada, não o fluxo de sessão do jogador.
 */
export class AdminFirebaseRepository {

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

	private userDoc(uid: string) {
		return db.collection("User").doc(uid);
	}
}
