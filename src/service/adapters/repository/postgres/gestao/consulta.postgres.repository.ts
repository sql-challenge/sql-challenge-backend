import { pool } from "../../../../db/postgresql/postgresqlConfig";
import { Consulta } from "../../../../core/domain/consulta.entity";
import { IConsultaPort } from "../../../../core/ports/consulta.port";

export class ConsultaPostgresRepository implements IConsultaPort {

    async getAll(): Promise<Consulta[]> {
        const result = await pool.query(`SELECT * FROM consulta`);

        return result.rows.map(
            (r) => new Consulta(Number(r.id), Number(r.id_capitulo), r.query, r.colunas, r.resultado)
        );
    }

    async getById(id: number): Promise<Consulta> {
        const result = await pool.query(
            `SELECT * FROM consulta WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) throw new Error("Consulta não encontrada.");

        const r = result.rows[0];
        return new Consulta(Number(r.id), Number(r.id_capitulo), r.query, r.colunas, r.resultado);
    }

    async getByCapituloId(idCapitulo: number): Promise<Consulta[]> {
        const result = await pool.query(
            `SELECT * FROM consulta WHERE id_capitulo = $1`,
            [idCapitulo]
        );

        return Promise.all(result.rows.map(async (r) => {
            let resultado = Array.isArray(r.resultado) ? r.resultado : [];
            if (resultado.length === 0 && r.query) {
                try {
                    const queryResult = await pool.query(r.query);
                    resultado = queryResult.rows;
                } catch {
                    resultado = [];
                }
            }
            return new Consulta(Number(r.id), Number(r.id_capitulo), r.query, r.colunas, resultado);
        }));
    }
}
