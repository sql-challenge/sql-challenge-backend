import { pool } from "../../../../db/postgresql/postgresqlConfig";
import { IChallengePort } from "../../../../core/ports/challenge.port";
import {
    Mystery,
    MysteryDetail,
    Hint,
    DatabaseSchema,
    Table,
    Column,
    Relationship,
    QueryResult,
} from "../../../../core/domain/challenge.entity";

export class ChallengePostgresRepository implements IChallengePort {

    // ─── GET ALL (listing) ───────────────────────────────────────────

    async getAll(): Promise<Mystery[]> {
        const result = await pool.query(
            "SELECT * FROM desafio ORDER BY id ASC"
        );

        return result.rows.map((row: any) => this.mapRowToMystery(row));
    }

    // ─── GET BY ID (full detail) ────────────────────��────────────────

    async getById(id: string): Promise<MysteryDetail | null> {
        const desafioId = parseInt(id, 10);
        if (isNaN(desafioId)) return null;

        // 1. Desafio
        const desafioResult = await pool.query(
            "SELECT * FROM desafio WHERE id = $1",
            [desafioId]
        );

        if (desafioResult.rows.length === 0) return null;

        const desafio = desafioResult.rows[0];
        const mystery = this.mapRowToMystery(desafio);

        // 2. Capitulo (1:1 with Desafio)
        const capituloResult = await pool.query(
            "SELECT * FROM capitulo WHERE id_desafio = $1",
            [desafioId]
        );

        if (capituloResult.rows.length === 0) {
            return {
                ...mystery,
                storyIntro: "",
                storyContext: "",
                objectives: [],
                hints: [],
                database: { tables: [], relationships: [] },
                expectedOutput: { columns: [], rows: [] },
                testCases: [],
            };
        }

        const capitulo = capituloResult.rows[0];
        const capituloId: number = capitulo.id;

        // 3. Parallel queries for all sub-entities
        const [
            objetivos,
            hints,
            database,
            expectedOutput,
        ] = await Promise.all([
            this.fetchObjetivos(capituloId),
            this.fetchHints(capituloId),
            this.fetchDatabaseSchema(capituloId),
            this.fetchExpectedOutput(capituloId),
        ]);

        return {
            ...mystery,
            storyIntro: capitulo.intro_historia || "",
            storyContext: capitulo.contexto_historia || "",
            objectives: objetivos,
            hints,
            database,
            expectedOutput,
            testCases: [], // no DB table for test cases yet
        };
    }

    // ─── PRIVATE: Map Desafio row → Mystery ──────────────────────────

    private mapRowToMystery(row: any): Mystery {
        return {
            id: row.id.toString(),
            title: row.titulo,
            description: row.descricao,
            difficulty: "beginner",       // not in DB — default
            category: "",                 // not in DB — default
            xpReward: row.xp_recompensa ?? 0,
            estimatedTime: row.tempo_estimado || "",
            status: "available",          // not in DB — default
            completionRate: parseFloat(row.taxa_conclusao) || 0,
            icon: "🔍",                  // not in DB — default
            tags: [],                     // not in DB — default
            createdAt: row.criado_em?.toISOString?.() ?? "",
            updatedAt: row.atualizado_em?.toISOString?.() ?? "",
        };
    }

    // ─── PRIVATE: Objetivos → string[] ───────────────────────────────

    private async fetchObjetivos(capituloId: number): Promise<string[]> {
        const result = await pool.query(
            "SELECT descricao FROM objetivo WHERE id_capitulo = $1 ORDER BY ordem ASC",
            [capituloId]
        );

        return result.rows.map((row: any) => row.descricao);
    }

    // ─── PRIVATE: Dicas → Hint[] ─────────────────────────────────────

    private async fetchHints(capituloId: number): Promise<Hint[]> {
        const result = await pool.query(
            "SELECT * FROM dica WHERE id_capitulo = $1 ORDER BY ordem ASC",
            [capituloId]
        );

        return result.rows.map((row: any) => ({
            id: row.id.toString(),
            order: row.ordem,
            content: row.conteudo,
            xpPenalty: row.penalidade_xp ?? 0,
        }));
    }

    // ─── PRIVATE: Visao + sub-tables → DatabaseSchema ────────────────

    private async fetchDatabaseSchema(capituloId: number): Promise<DatabaseSchema> {
        // Visao
        const visaoResult = await pool.query(
            "SELECT * FROM visao WHERE id_capitulo = $1",
            [capituloId]
        );

        if (visaoResult.rows.length === 0) {
            return { tables: [], relationships: [] };
        }

        const visaoId: number = visaoResult.rows[0].id;

        // Parallel: tables + relationships
        const [tables, relationships] = await Promise.all([
            this.fetchTables(visaoId),
            this.fetchRelationships(visaoId),
        ]);

        return { tables, relationships };
    }

    // ─── PRIVATE: Visao_Tabela + columns + sampleData → Table[] ──────

    private async fetchTables(visaoId: number): Promise<Table[]> {
        const tabelaResult = await pool.query(
            "SELECT * FROM visao_tabela WHERE id_visao = $1 ORDER BY id ASC",
            [visaoId]
        );

        const tables: Table[] = [];

        for (const tabela of tabelaResult.rows) {
            const [columns, sampleData] = await Promise.all([
                this.fetchColumns(tabela.id),
                this.fetchSampleData(tabela.id),
            ]);

            tables.push({
                name: tabela.nome,
                description: tabela.descricao || "",
                columns,
                sampleData,
            });
        }

        return tables;
    }

    // ─── PRIVATE: Visao_Coluna → Column[] ──────────��─────────────────

    private async fetchColumns(tabelaId: number): Promise<Column[]> {
        const result = await pool.query(
            "SELECT * FROM visao_coluna WHERE id_tabela = $1 ORDER BY id ASC",
            [tabelaId]
        );

        return result.rows.map((row: any) => {
            const column: Column = {
                name: row.nome,
                type: row.tipo,
                nullable: row.nulavel ?? false,
                primaryKey: row.chave_primaria ?? false,
                description: row.descricao || "",
            };

            // Only add foreignKey if both fk_tabela and fk_coluna are present
            if (row.fk_tabela && row.fk_coluna) {
                column.foreignKey = {
                    table: row.fk_tabela,
                    column: row.fk_coluna,
                };
            }

            return column;
        });
    }

    // ─── PRIVATE: Visao_DadoExemplo → sampleData[] ──────────────────

    private async fetchSampleData(tabelaId: number): Promise<Record<string, unknown>[]> {
        const result = await pool.query(
            "SELECT dados FROM visao_dadoexemplo WHERE id_tabela = $1 ORDER BY id ASC",
            [tabelaId]
        );

        return result.rows.map((row: any) => row.dados as Record<string, unknown>);
    }

    // ─── PRIVATE: Visao_Relacionamento → Relationship[] ───────────���──

    private async fetchRelationships(visaoId: number): Promise<Relationship[]> {
        const result = await pool.query(
            "SELECT * FROM visao_relacionamento WHERE id_visao = $1 ORDER BY id ASC",
            [visaoId]
        );

        return result.rows.map((row: any) => ({
            fromTable: row.tabela_origem,
            toTable: row.tabela_destino,
            type: row.tipo as "one-to-one" | "one-to-many" | "many-to-many",
            fromColumn: row.coluna_origem,
            toColumn: row.coluna_destino,
        }));
    }

    // ─── PRIVATE: Consulta → QueryResult ─────────────────────────────

    private async fetchExpectedOutput(capituloId: number): Promise<QueryResult> {
        const result = await pool.query(
            "SELECT * FROM consulta WHERE id_capitulo = $1 LIMIT 1",
            [capituloId]
        );

        if (result.rows.length === 0) {
            return { columns: [], rows: [] };
        }

        const row = result.rows[0];

        return {
            columns: row.colunas || [],
            rows: (row.resultado as Record<string, unknown>[]) || [],
        };
    }
}