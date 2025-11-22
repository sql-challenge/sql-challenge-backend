import { pool } from "../../../db/postgresql/postgresqlConfig";
import { Consulta } from "../../../core/domain/consulta.entity";
import { IConsultaPort } from "../../../core/ports/consulta.port";

export class ConsultaPostgresRepository implements IConsultaPort {

	async getAll(): Promise<Consulta[]> {
		const result = await pool.query(`SELECT * FROM consulta`);

		return result.rows.map(
			(r) => new Consulta(r.id, r.query)
		);
	}

	async getById(id: number): Promise<Consulta | null> {
		const result = await pool.query(
			`SELECT * FROM consulta WHERE id = $1`,
			[id]
		);

		if (result.rows.length === 0) return null;

		const r = result.rows[0];
		return new Consulta(r.id, r.query);
	}
}
