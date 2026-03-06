// src/adapters/repository/postgres/capitulo.postgres.repository.ts

import { Capitulo } from "../../../../core/domain/capitulo.entity";
import { Consulta } from "../../../../core/domain/consulta.entity";
import { Dica } from "../../../../core/domain/dica.entity";
import { Objetivo } from "../../../../core/domain/objetivo.entity";
import { ICapituloPort } from "../../../../core/ports/capitulo.port";
import { pool } from "../../../../db/postgresql/postgresqlConfig";

export class CapituloPostgresRepository implements ICapituloPort {
    
    async getAll(): Promise<Capitulo[]> {
        const result = await pool.query("SELECT * FROM capitulo ORDER BY id ASC");

        return result.rows.map((row: any) => 
            new Capitulo(
                row.id,
                row.id_desafio,
                row.intro_historia,
                row.xp_recompensa,
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
            row.xp_recompensa,
            row.contexto_historia,
            row.numero
        );
    }

    async getByDesafioId(desafioId: number): Promise<Capitulo[]> {
        const result = await pool.query("SELECT * FROM capitulo WHERE id_desafio = $1 ORDER BY numero ASC", [desafioId]);
        // [TODO]: considerar ordenação por número do capítulo, e não por ID, para garantir ordem correta dos capítulos dentro do desafio.
        return result.rows.map((row: any) => 
            new Capitulo(
                row.id,
                row.id_desafio,
                row.intro_historia,
                row.xp_recompensa,
                row.contexto_historia,
                row.numero
            )
        );
    }
    // async getWithCapituloDetails(id: number): Promise<Capitulo> {
    //     // [TODO]: implementar query que traga o capítulo junto com seus objetivos, dicas e consulta de solução. Pode ser uma query com JOINs ou múltiplas queries.
    //     const capitulo = await this.getById(id);
        
    //     // const [objetivosResult, dicasResult, consultaResult] = await Promise.all([
    //     //     pool.query("SELECT * FROM objetivo WHERE id_capitulo = $1", [id]),
    //     //     pool.query("SELECT * FROM dica WHERE id_capitulo = $1", [id]),
    //     //     pool.query("SELECT * FROM consulta WHERE id_capitulo = $1", [id])
    //     // ]);
    //     // const objetivosResult = await pool.query("SELECT * FROM objetivo WHERE id_capitulo = $1", [id]);
    //     // const dicasResult = await pool.query("SELECT * FROM dica WHERE id_capitulo = $1", [id]);
    //     // const consultaResult = await pool.query("SELECT * FROM consulta WHERE id_capitulo = $1", [id]);

    //     return {
    //         ...capitulo,
    //         // objetivos: objetivosResult.rows.map((row: any) => new Objetivo(row.id, id, row.descricao, row.id_capitulo)),
    //         // dicas: dicasResult.rows.map((row: any) => new Dica(row.id, id, row.descricao, row.id_capitulo, row.penalidade_xp)),
    //         // consultaSolucao: consultaResult.rows[0] ? new Consulta(consultaResult.rows[0].id, id, consultaResult.rows[0].descricao, consultaResult.rows[0].id_capitulo) : null
    //     };
    // }
}
