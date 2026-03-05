import { Log } from "../../../core/domain/log.entity";
import { ILogPort } from "../../../core/ports/log.port";
import { pool } from "../../../db/postgresql/postgresqlConfig";

export class LogPostgresRepository implements ILogPort {

    async getAll(): Promise<Log[]> {
        const result = await pool.query("SELECT * FROM log ORDER BY id ASC");

        return result.rows.map((row: any) =>
            new Log(
                row.id,
                row.table_name,
                row.operation,
                row.old_data,
                row.new_data,
                row.changed_by,
                row.changed_at
            )
        );
    }

    async getById(id: number): Promise<Log> {
        const result = await pool.query(
            "SELECT * FROM log WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0)
            throw new Error("Log não encontrado.");

        const row = result.rows[0];

        return new Log(
            row.id,
            row.table_name,
            row.operation,
            row.old_data,
            row.new_data,
            row.changed_by,
            row.changed_at
        );
    }
}
