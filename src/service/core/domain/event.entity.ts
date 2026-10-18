export type EventType =
	| "session_start"
	| "session_end"
	| "query_run"
	| "sql_error"
	| "hint_revealed"
	| "objetivo_completed"
	| "chapter_victory";

/** Evento já normalizado (uid injetado no servidor, nunca vindo do body). */
export interface EventDocument {
	uid: string;
	type: EventType;
	desafioId: string;
	capituloId: number;
	payload: Record<string, unknown>;
	/** Timestamp do cliente (quando o evento aconteceu na máquina dele). */
	clientTs: Date | null;
	/** Timestamp do servidor (chegada/ingestão). */
	serverTs: Date;
}

/** Entrada de batch vinda da API (antes de virar EventDocument). */
export interface EventInput {
	type: EventType;
	desafioId: string;
	capituloId: number;
	payload?: Record<string, unknown>;
	clientTs?: number | null;
}
