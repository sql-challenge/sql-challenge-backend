import { Dica } from "../../../../core/domain/dica.entity";
import { IDicaPort } from "../../../../core/ports/dica.port";
import { pool } from "../../../../db/postgresql/postgresqlConfig";

export class DicaPostgresRepository implements IDicaPort {

    async getAll(): Promise<Dica[]> {
        const result = await pool.query("SELECT * FROM dica ORDER BY id ASC");

        return result.rows.map((row: any) =>
            new Dica(
                Number(row.id),
                Number(row.id_capitulo),
                Number(row.ordem),
                row.conteudo,
                Number(row.penalidade_xp)
            )
        );
    }

    async getById(id: number): Promise<Dica> {
        const result = await pool.query(
            "SELECT * FROM dica WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0)
            throw new Error("Dica não encontrada.");

        const row = result.rows[0];

        return new Dica(
            Number(row.id),
            Number(row.id_capitulo),
            Number(row.ordem),
            row.conteudo,
            Number(row.penalidade_xp)
        );
    }

    async getByCapituloId(idCapitulo: number): Promise<Dica[]> {
        const result = await pool.query(
            "SELECT * FROM dica WHERE id_capitulo = $1 ORDER BY ordem ASC",
            [idCapitulo]
        );

        return result.rows.map((row: any) =>
            new Dica(
                Number(row.id),
                Number(row.id_capitulo),
                Number(row.ordem),
                row.conteudo,
                Number(row.penalidade_xp)
            )
        );
    }
}
