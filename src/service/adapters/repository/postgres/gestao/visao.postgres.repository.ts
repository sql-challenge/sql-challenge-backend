import { IVisaoPort } from "../../../../core/ports/visao.port";
import { Visao } from "../../../../core/domain/visao.entity";
import {pool} from "../../../../db/postgresql/postgresqlConfig";

export class VisaoPostgresRepository implements IVisaoPort {
	private table = "visao";

	async getAll(): Promise<Visao[]> {
		const result = await pool.query(`SELECT id, id_capitulo, comando FROM ${this.table}`);
		return result.rows.map((row: { id: any; id_capitulo: number; comando: string }) => new Visao(Number(row.id), Number(row.id_capitulo), row.comando));
	}

	async getById(id: number): Promise<Visao> {
		const result = await pool.query(
			`SELECT id, id_capitulo, comando FROM ${this.table} WHERE id = $1`,
			[id]
		);

		if (result.rows.length === 0) throw new Error("Visão não encontrada!");

		const row = result.rows[0];
		return new Visao(Number(row.id), Number(row.id_capitulo), row.comando);
	}

	async getByCapituloId(idCapitulo: number): Promise<Visao[]> {
		const result = await pool.query(
			`SELECT id, id_capitulo, comando FROM ${this.table} WHERE id_capitulo = $1 ORDER BY id ASC`,
			[idCapitulo]
		);
		return result.rows.map((row: any) => new Visao(Number(row.id), Number(row.id_capitulo), row.comando));
	}

	async executeView(comando: string): Promise<Record<string, unknown>[]> {
		if (!/^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*$/.test(comando))
			throw new Error("Nome de visão inválido.");
		const result = await pool.query(`SELECT * FROM ${comando}`);
		return result.rows;
	}
}
