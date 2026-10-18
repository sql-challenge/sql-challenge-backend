import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../db/firebase/firebaseAdminConfig";
import { ChapterSession, SaveSessionDto } from "../../../core/domain/chapter-session.entity";
import { IChapterSessionPort } from "../../../core/ports/chapter-session.port";

/**
 * Crédito máximo de tempo "órfão" ao reconciliar um fechamento sujo.
 * Autosave roda a cada 60s: uma sessão que fechou sem save final perde no
 * máximo ~60s de jogo real. O cap generoso (15 min) cobre falhas de rede,
 * mas impede que um usuário que sumiu ontem receba horas fantasmas ao voltar.
 */
const MAX_ORPHAN_CREDIT_SECONDS = 15 * 60;

export class ChapterSessionFirebaseRepository implements IChapterSessionPort {

	private docRef(uid: string, desafioId: string, capituloId: number) {
		const sessionId = `${desafioId}_${capituloId}`;
		return db.collection("User").doc(uid).collection("chapter_sessions").doc(sessionId);
	}

	async getSession(uid: string, desafioId: string, capituloId: number): Promise<ChapterSession | null> {
		const ref = this.docRef(uid, desafioId, capituloId);
		const snap = await ref.get();

		if (!snap.exists) return null;

		const d = snap.data()!;
		const session: ChapterSession = {
			uid,
			desafioId,
			capituloId,
			totalSeconds: d.total_seconds ?? 0,
			lastStartedAt: d.last_started_at ? (d.last_started_at as Timestamp).toDate() : null,
			isActive: d.is_active ?? false,
			currentObjetivoIndex: d.current_objetivo_index ?? 0,
			completedObjetivos: d.completed_objetivos ?? [],
			hintsRevealed: d.hints_revealed ?? [],
			firstStartedAt: d.first_started_at ? (d.first_started_at as Timestamp).toDate() : null,
			lastActivityAt: d.last_activity_at ? (d.last_activity_at as Timestamp).toDate() : null,
			sessionCount: d.session_count ?? 0,
		};

		if (session.isActive) {
			// ── Reconciliação de fechamento sujo ─────────────────────
			// A sessão ficou ativa (crash, aba morta, beacon perdido): o tempo
			// entre o último autosave (last_started_at) e o exit não foi contado.
			// Credita min(agora − last_started_at, cap) ao total — heals o gap
			// sem permitir inflar horas paradas. Idempotente: limpa o marcador.
			if (session.lastStartedAt) {
				const orphanMs = Date.now() - session.lastStartedAt.getTime();
				const orphanSeconds = Math.min(
					Math.max(0, Math.floor(orphanMs / 1000)),
					MAX_ORPHAN_CREDIT_SECONDS
				);

				if (orphanSeconds > 0) {
					session.totalSeconds += orphanSeconds;
					const creditedActivityAt = new Date(session.lastStartedAt.getTime() + orphanSeconds * 1000);
					if (!session.lastActivityAt || creditedActivityAt > session.lastActivityAt) {
						session.lastActivityAt = creditedActivityAt;
					}
				}
			}

			await ref.set({
				total_seconds: session.totalSeconds,
				last_activity_at: session.lastActivityAt ? Timestamp.fromDate(session.lastActivityAt) : null,
				is_active: false,
				last_started_at: null, // consome o marcador → reconciliação idempotente
			}, { merge: true });

			session.isActive = false;
			session.lastStartedAt = null;
		}

		return session;
	}

	async saveSession(
		uid: string,
		desafioId: string,
		capituloId: number,
		dto: SaveSessionDto
	): Promise<ChapterSession> {
		const ref = this.docRef(uid, desafioId, capituloId);
		const snap = await ref.get();

		const prev = snap.exists ? snap.data()! : {};
		const prevTotal = prev.total_seconds ?? 0;
		const newTotal = prevTotal + Math.max(0, dto.elapsedSeconds);

		// Sessão nova = transição inactive → active. O primeiro autosave após
		// abrir o capítulo (ou o primeiro save de um capítulo nunca jogado) conta.
		const wasActive = prev.is_active ?? false;
		const sessionCount = (prev.session_count ?? 0) + (!dto.isClosing && !wasActive ? 1 : 0);

		const now = Timestamp.now();
		// first_started_at: marca na primeira gravação, nunca sobrescreve
		const firstStartedAt = prev.first_started_at ?? now;

		const payload: Record<string, unknown> = {
			total_seconds: newTotal,
			current_objetivo_index: dto.currentObjetivoIndex,
			completed_objetivos: dto.completedObjetivos,
			hints_revealed: dto.hintsRevealed,
			first_started_at: firstStartedAt,
			last_activity_at: now,
			session_count: sessionCount,
			desafio_id: desafioId,
			capitulo_id: capituloId,
		};

		if (dto.isClosing) {
			payload.is_active = false;
			payload.last_started_at = null;
		} else {
			payload.is_active = true;
			payload.last_started_at = now;
		}

		await ref.set(payload, { merge: true });

		return {
			uid,
			desafioId,
			capituloId,
			totalSeconds: newTotal,
			lastStartedAt: dto.isClosing ? null : now.toDate(),
			isActive: !dto.isClosing,
			currentObjetivoIndex: dto.currentObjetivoIndex,
			completedObjetivos: dto.completedObjetivos,
			hintsRevealed: dto.hintsRevealed,
			firstStartedAt: (firstStartedAt as Timestamp).toDate(),
			lastActivityAt: now.toDate(),
			sessionCount,
		};
	}
}
