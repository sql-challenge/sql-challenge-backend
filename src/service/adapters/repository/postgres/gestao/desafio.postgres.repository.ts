import { Capitulo } from "../../../../core/domain/capitulo.entity";
import { Desafio } from "../../../../core/domain/desafio.entity";
import { IDesafioPort } from "../../../../core/ports/desafio.port";
import { pool } from "../../../../db/postgresql/postgresqlConfig";

export class DesafioPostgresRepository implements IDesafioPort {

    async getAll(): Promise<Desafio[]> {
        const result = await pool.query("SELECT * FROM desafio ORDER BY id ASC");

        return result.rows.map((row: any) =>
            new Desafio(
                Number(row.id),
                row.titulo,
                row.descricao,
                row.tempo_estimado,
                Number(row.taxa_conclusao),
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
            Number(row.id),
            row.titulo,
            row.descricao,
            row.tempo_estimado,
            Number(row.taxa_conclusao),
            row.criado_em,
            row.atualizado_em
        );
    }

    async getWithCapitulo(id: number, capituloId: number): Promise<Desafio & Capitulo> {
        const result = await pool.query(
            `SELECT d.*, c.id AS capitulo_id, c.intro_historia, c.xp_recompensa, c.contexto_historia, c.numero
             FROM desafio d
             JOIN capitulo c ON d.id = c.id_desafio
             WHERE d.id = $1 AND c.id = $2`,
            [id, capituloId]
        );

        if (result.rows.length === 0)
            throw new Error("Desafio com capítulo não encontrado.");

        const row = result.rows[0];

        return {
            id: Number(row.id),
            titulo: row.titulo,
            descricao: row.descricao,
            tempoEstimado: row.tempo_estimado,
            taxaConclusao: Number(row.taxa_conclusao),
            criadoEm: row.criado_em,
            atualizadoEm: row.atualizado_em,
            idDesafio: Number(row.id),
            introHistoria: row.intro_historia,
            xpRecompensa: Number(row.xp_recompensa),
            contextoHistoria: row.contexto_historia,
            numero: Number(row.numero)
        };
    }
}
