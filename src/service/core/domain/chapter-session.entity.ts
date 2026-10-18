export interface ChapterSession {
  uid: string;
  desafioId: string;
  capituloId: number;
  totalSeconds: number;
  lastStartedAt: Date | null;
  isActive: boolean;
  currentObjetivoIndex: number;
  completedObjetivos: number[];
  hintsRevealed: number[];
  /** Início da primeira sessão deste capítulo (nunca sobrescrito). */
  firstStartedAt: Date | null;
  /** Última atividade conhecida (último save / reconciliação). */
  lastActivityAt: Date | null;
  /** Quantas "sentadas" (aberturas) este capítulo já teve. */
  sessionCount: number;
}

export interface SaveSessionDto {
  elapsedSeconds: number;
  currentObjetivoIndex: number;
  completedObjetivos: number[];
  hintsRevealed: number[];
  isClosing: boolean;
}

export function emptySession(uid: string, desafioId: string, capituloId: number): ChapterSession {
  return {
    uid,
    desafioId,
    capituloId,
    totalSeconds: 0,
    lastStartedAt: null,
    isActive: false,
    currentObjetivoIndex: 0,
    completedObjetivos: [],
    hintsRevealed: [],
    firstStartedAt: null,
    lastActivityAt: null,
    sessionCount: 0,
  };
}
