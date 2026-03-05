import { IVisaoPort } from "../../../../core/ports/visao.port";
import { Visao } from "../../../../core/domain/visao.entity";
import {pool} from "../../../../db/postgresql/postgresqlConfig";

export class VisaoPostgresRepository implements IVisaoPort {
	private table = "visao";

	async getAll(): Promise<Visao[]> {
		const result = await pool.query(`SELECT id, id_capitulo FROM ${this.table}`);
		return result.rows.map((row: { id: any; id_capitulo: number; }) => new Visao(Number(row.id), Number(row.id_capitulo)));
	}

	async getById(id: number): Promise<Visao> {
		const result = await pool.query(
			`SELECT id, id_capitulo FROM ${this.table} WHERE id = $1`,
			[id]
		);

		if (result.rows.length === 0) throw new Error("Visão não encontrada!");

		const row = result.rows[0];
		return new Visao(Number(row.id), Number(row.id_capitulo));
	}
}
