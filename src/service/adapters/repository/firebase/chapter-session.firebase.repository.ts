import {
  collection, doc, getDoc, setDoc, Timestamp
} from "firebase/firestore";
import { db } from "../../../db/firebase/firebaseConfig";
import { ChapterSession, SaveSessionDto, emptySession } from "../../../core/domain/chapter-session.entity";
import { IChapterSessionPort } from "../../../core/ports/chapter-session.port";

export class ChapterSessionFirebaseRepository implements IChapterSessionPort {

  private docRef(uid: string, desafioId: string, capituloId: number) {
    const sessionId = `${desafioId}_${capituloId}`;
    return doc(collection(doc(collection(db, "User"), uid), "chapter_sessions"), sessionId);
  }

  async getSession(uid: string, desafioId: string, capituloId: number): Promise<ChapterSession | null> {
    const ref = this.docRef(uid, desafioId, capituloId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const d = snap.data();
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
    };

    // Se a sessão ficou marcada como ativa (fechou sem salvar corretamente),
    // reseta o flag — o tempo perdido daquela sessão é descartado.
    if (session.isActive) {
      await setDoc(ref, { is_active: false }, { merge: true });
      session.isActive = false;
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
    const snap = await getDoc(ref);

    const prevTotal = snap.exists() ? (snap.data().total_seconds ?? 0) : 0;
    const newTotal = prevTotal + Math.max(0, dto.elapsedSeconds);

    const payload: Record<string, unknown> = {
      total_seconds: newTotal,
      current_objetivo_index: dto.currentObjetivoIndex,
      completed_objetivos: dto.completedObjetivos,
      hints_revealed: dto.hintsRevealed,
      desafio_id: desafioId,
      capitulo_id: capituloId,
    };

    if (dto.isClosing) {
      payload.is_active = false;
      payload.last_started_at = null;
    } else {
      payload.is_active = true;
      payload.last_started_at = Timestamp.now();
    }

    await setDoc(ref, payload, { merge: true });

    return {
      uid,
      desafioId,
      capituloId,
      totalSeconds: newTotal,
      lastStartedAt: dto.isClosing ? null : new Date(),
      isActive: !dto.isClosing,
      currentObjetivoIndex: dto.currentObjetivoIndex,
      completedObjetivos: dto.completedObjetivos,
      hintsRevealed: dto.hintsRevealed,
    };
  }
}
