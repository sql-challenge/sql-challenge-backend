import { EventInput } from "../domain/event.entity";

export interface IEventPort {
	/** Grava um lote de eventos (uid é injetado aqui, fora do payload). */
	insertMany(uid: string, events: EventInput[]): Promise<void>;
}
