import { EventInput } from "../domain/event.entity";

export interface IEventPort {
	/** Grava um lote de eventos (uid/classCode são injetados aqui, fora do payload). */
	insertMany(uid: string, events: EventInput[], classCode?: string): Promise<void>;
}
