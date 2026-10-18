import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../db/firebase/firebaseAdminConfig";
import { SecurityFlag, SecurityFlagDoc } from "../../../core/domain/security-flag.entity";
import { ISecurityFlagPort } from "../../../core/ports/security-flag.port";

/**
 * Coleção top-level `security_flags`:
 *   { uid, type, detail, desafio_id, capitulo_id, server_ts }
 *
 * Auditoria é best-effort: falhas são logadas e engolidas — o gameplay
 * do aluno jamais deve travar por causa de um flag.
 */
export class SecurityFlagFirebaseRepository implements ISecurityFlagPort {
	async insertMany(flags: SecurityFlag[]): Promise<void> {
		if (flags.length === 0) return;
		try {
			const batch = db.batch();
			const col = db.collection("security_flags");
			const serverTs = Timestamp.now();
			for (const f of flags) {
				batch.set(col.doc(), {
					uid: f.uid,
					type: f.type,
					detail: f.detail,
					desafio_id: f.desafioId,
					capitulo_id: f.capituloId,
					server_ts: serverTs,
				});
			}
			await batch.commit();
		} catch (err) {
			console.error("[SecurityFlag] falha ao gravar flags (best-effort):", err);
		}
	}

	async listByDesafio(desafioId?: string): Promise<SecurityFlagDoc[]> {
		let snap;
		if (desafioId) {
			// where single-field (índice automático); ordenação em memória
			snap = await db.collection("security_flags")
				.where("desafio_id", "==", desafioId)
				.limit(300)
				.get();
		} else {
			snap = await db.collection("security_flags")
				.limit(300)
				.get();
		}

		return snap.docs
			.map((doc) => {
				const d = doc.data();
				return {
					id: doc.id,
					uid: (d.uid as string) ?? "",
					type: (d.type as SecurityFlagDoc["type"]) ?? "",
					detail: (d.detail as string) ?? "",
					desafioId: (d.desafio_id as string) ?? "",
					capituloId: (d.capitulo_id as number) ?? 0,
					serverTs: d.server_ts ? (d.server_ts as Timestamp).toDate() : new Date(0),
				};
			})
			.sort((a, b) => b.serverTs.getTime() - a.serverTs.getTime())
			.slice(0, 200);
	}
}
