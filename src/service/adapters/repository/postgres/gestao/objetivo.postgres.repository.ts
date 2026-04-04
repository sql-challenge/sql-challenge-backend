import { Objetivo } from "../../../../core/domain/objetivo.entity";
import { IObjetivoPort } from "../../../../core/ports/objetivo.port";
import { pool } from "../../../../db/postgresql/postgresqlConfig";

export class ObjetivoPostgresRepository implements IObjetivoPort {

    async getAll(): Promise<Objetivo[]> {
        const result = await pool.query("SELECT * FROM objetivo ORDER BY id ASC");

        return result.rows.map((row: any) =>
            new Objetivo(
                row.id,
                row.id_capitulo,
                row.descricao,
                row.ordem,
                row.nivel
            )
        );
    }

    async getById(id: number): Promise<Objetivo> {
        const result = await pool.query(
            "SELECT * FROM objetivo WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0)
            throw new Error("Objetivo não encontrado.");

        const row = result.rows[0];

        return new Objetivo(
            row.id,
            row.id_capitulo,
            row.descricao,
            row.ordem,
            row.nivel
        );
    }

    async getByCapituloId(capituloId: number): Promise<Objetivo[]> {
        const result = await pool.query(
            "SELECT * FROM objetivo WHERE id_capitulo = $1 ORDER BY ordem ASC",
            [capituloId]
        );

        return result.rows.map((row: any) =>
            new Objetivo(
                row.id,
                row.id_capitulo,
                row.descricao,
                row.ordem,
                row.nivel
            )
        );
    }
}
