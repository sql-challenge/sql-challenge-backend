import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../db/firebase/firebaseAdminConfig";
import { EventDocument, EventInput } from "../../../core/domain/event.entity";
import { IEventPort } from "../../../core/ports/event.port";

/**
 * Coleção top-level `events` (queryável entre alunos, p/ dashboard do professor):
 *   { uid, type, desafio_id, capitulo_id, payload, client_ts, server_ts }
 * WriteBatch de até 25 docs — muito abaixo do limite de 500 do Firestore.
 */
export class EventFirebaseRepository implements IEventPort {
	async insertMany(uid: string, events: EventInput[], classCode?: string): Promise<void> {
		if (events.length === 0) return;

		const batch = db.batch();
		const col = db.collection("events");
		const serverTs = Timestamp.now();

		for (const e of events) {
			const doc: EventDocument = {
				uid,
				type: e.type,
				desafioId: e.desafioId,
				capituloId: e.capituloId,
				payload: e.payload ?? {},
				classCode: classCode ?? null,
				clientTs: e.clientTs ? new Date(e.clientTs) : null,
				serverTs: serverTs.toDate(),
			};
			batch.set(col.doc(), doc);
		}

		await batch.commit();
	}
}
