import { EventInput } from "../domain/event.entity";
import { IEventPort } from "../ports/event.port";

export class EventUseCase {
	constructor(private port: IEventPort) {}

	/** Ingestão de lote — normaliza payload ausente; vazio não grava nada. */
	async record(uid: string, events: EventInput[], classCode?: string): Promise<number> {
		if (events.length === 0) return 0;
		await this.port.insertMany(
			uid,
			events.map((e) => ({ ...e, payload: e.payload ?? {} })),
			classCode
		);
		return events.length;
	}
}
