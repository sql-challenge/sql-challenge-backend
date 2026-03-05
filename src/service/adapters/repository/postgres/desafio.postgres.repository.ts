import { Desafio } from "../../../core/domain/desafio.entity";
import { IDesafioPort } from "../../../core/ports/desafio.port";
import { pool } from "../../../db/postgresql/postgresqlConfig";

export class DesafioPostgresRepository implements IDesafioPort {
    
    async getAll(): Promise<Desafio[]> {
        const result = await pool.query("SELECT * FROM desafio ORDER BY id ASC");

        return result.rows.map((row: any) => 
            new Desafio(
                row.id,
                row.titulo,
                row.descricao,
                row.xp_recompensa,
                row.tempo_estimado,
                row.taxa_conclusao,
                row.criado_em,
                row.atualizado_em
            )
        );
    }

    async getById(id: number): Promise<Desafio> {
        const result = await pool.query(
            "SELECT * FROM desafio WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0)
            throw new Error("Desafio não encontrado.");

        const row = result.rows[0];

        return new Desafio(
            row.id,
            row.titulo,
            row.descricao,
            row.xp_recompensa,
            row.tempo_estimado,
            row.taxa_conclusao,
            row.criado_em,
            row.atualizado_em
        );
    }
}
