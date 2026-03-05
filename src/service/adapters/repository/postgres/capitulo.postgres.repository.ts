// src/adapters/repository/postgres/capitulo.postgres.repository.ts

import { Capitulo } from "../../../core/domain/capitulo.entity";
import { ICapituloPort } from "../../../core/ports/capitulo.port";
import { pool } from "../../../db/postgresql/postgresqlConfig";

export class CapituloPostgresRepository implements ICapituloPort {
    
    async getAll(): Promise<Capitulo[]> {
        const result = await pool.query("SELECT * FROM capitulo ORDER BY id ASC");

        return result.rows.map((row: { id: number; id_desafio: number; intro_historia: string; contexto_historia: string; numero: number; }) => 
            new Capitulo(
                row.id,
                row.id_desafio,
                row.intro_historia,
                row.contexto_historia,
                row.numero
            )
        );
    }

    async getById(id: number): Promise<Capitulo> {
        const result = await pool.query(
            "SELECT * FROM capitulo WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0)
            throw new Error("Capítulo não encontrado.");

        const row = result.rows[0];

        return new Capitulo(
            row.id,
            row.id_desafio,
            row.intro_historia,
            row.contexto_historia,
            row.numero
        );
    }
}
