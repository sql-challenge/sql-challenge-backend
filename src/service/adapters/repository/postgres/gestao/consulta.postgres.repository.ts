import { pool } from "../../../../db/postgresql/postgresqlConfig";
import { Consulta } from "../../../../core/domain/consulta.entity";
import { IConsultaPort } from "../../../../core/ports/consulta.port";

export class ConsultaPostgresRepository implements IConsultaPort {

    private mapRow(r: Record<string, unknown>): Consulta {
        return new Consulta(
            Number(r.id),
            Number(r.id_capitulo),
            r.id_objetivo != null ? Number(r.id_objetivo) : null,
            r.query as string,
            r.colunas as string[],
            r.resultado as Record<string, unknown>[]
        );
    }

    async getAll(): Promise<Consulta[]> {
        const result = await pool.query(`SELECT * FROM consulta`);
        return result.rows.map((r) => this.mapRow(r));
    }

    async getById(id: number): Promise<Consulta> {
        const result = await pool.query(
            `SELECT * FROM consulta WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) throw new Error("Consulta não encontrada.");
        return this.mapRow(result.rows[0]);
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
                    const queryResult = await pool.query(r.query as string);
                    resultado = queryResult.rows;
                } catch {
                    resultado = [];
                }
            }
            return new Consulta(
                Number(r.id),
                Number(r.id_capitulo),
                r.id_objetivo != null ? Number(r.id_objetivo) : null,
                r.query as string,
                r.colunas as string[],
                resultado
            );
        }));
    }

    async getByObjetivoId(idObjetivo: number): Promise<Consulta | null> {
        const result = await pool.query(
            `SELECT * FROM consulta WHERE id_objetivo = $1 LIMIT 1`,
            [idObjetivo]
        );

        if (result.rows.length === 0) return null;

        const r = result.rows[0];
        let resultado = Array.isArray(r.resultado) ? r.resultado : [];
        if (resultado.length === 0 && r.query) {
            try {
                const queryResult = await pool.query(r.query as string);
                resultado = queryResult.rows;
            } catch {
                resultado = [];
            }
        }
        return new Consulta(
            Number(r.id),
            Number(r.id_capitulo),
            Number(r.id_objetivo),
            r.query as string,
            r.colunas as string[],
            resultado
        );
    }
}
