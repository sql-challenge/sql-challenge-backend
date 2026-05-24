import { Request, Response } from "express";
import { DesafioUseCase } from "../../core/useCases/desafio.useCase";
import { DesafioPostgresRepository } from "../repository/postgres/gestao/desafio.postgres.repository";
import { CapituloUseCase } from "../../core/useCases/capitulo.useCase";
import { CapituloPostgresRepository } from "../repository/postgres/gestao/capitulo.postgres.repository";
import { ObjetivoUseCase } from "../../core/useCases/objetivo.useCase";
import { ObjetivoPostgresRepository } from "../repository/postgres/gestao/objetivo.postgres.repository";
import { DicaUseCase } from "../../core/useCases/dica.useCase";
import { DicaPostgresRepository } from "../repository/postgres/gestao/dica.postgres.repository";
import { ConsultaUseCase } from "../../core/useCases/consulta.useCase";
import { ConsultaPostgresRepository } from "../repository/postgres/gestao/consulta.postgres.repository";
import { VisaoUseCase } from "../../core/useCases/visao.useCase";
import { VisaoPostgresRepository } from "../repository/postgres/gestao/visao.postgres.repository";
import { Mystery, MysteryDetail } from "../../core/domain/challenge.entity";
import { Desafio } from "../../core/domain/desafio.entity";
import { asyncHandler } from "../middleware/asyncHandler";
import { NotFoundError } from "../errors/api-errors";

const desafioUseCase  = new DesafioUseCase(new DesafioPostgresRepository());
const capituloUseCase = new CapituloUseCase(new CapituloPostgresRepository());
const objetivoUseCase = new ObjetivoUseCase(new ObjetivoPostgresRepository());
const dicaUseCase     = new DicaUseCase(new DicaPostgresRepository());
const consultaUseCase = new ConsultaUseCase(new ConsultaPostgresRepository());
const visaoUseCase    = new VisaoUseCase(new VisaoPostgresRepository());

function toMystery(d: Desafio, xpReward = 0): Mystery {
    return {
        id: String(d.id),
        title: d.titulo,
        description: d.descricao,
        difficulty: "beginner",
        category: "SQL",
        xpReward,
        estimatedTime: d.tempoEstimado,
        status: "available",
        completionRate: d.taxaConclusao,
        icon: "🔍",
        tags: [],
        createdAt: d.criadoEm,
        updatedAt: d.atualizadoEm,
    };
}

class ChallengeController {
    getAll = asyncHandler(async (_req: Request, res: Response) => {
        const desafios = await desafioUseCase.getAll();
        const data: Mystery[] = desafios.map(d => toMystery(d));
        res.status(200).json({ data });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        const desafio = await desafioUseCase.getById(id);

        const capitulos = await capituloUseCase.getByDesafioId(desafio.id);
        if (capitulos.length === 0) throw new NotFoundError("Nenhum capítulo encontrado para este desafio.");
        const capitulo = capitulos[0];

        const [objetivos, dicas, consultaList, visaoList] = await Promise.all([
            objetivoUseCase.getByCapituloId(capitulo.id),
            dicaUseCase.getByCapituloId(capitulo.id),
            consultaUseCase.getByCapituloId(capitulo.id),
            visaoUseCase.getByCapituloId(capitulo.id),
        ]);

        if (consultaList.length === 0) throw new NotFoundError("Consulta solução não encontrada para este capítulo.");
        const consulta = consultaList[0];

        const visoes = await Promise.all(
            visaoList.map(async (v) => ({
                ...v,
                dados: await visaoUseCase.executeViewById(v.id),
            }))
        );

        const tables = visoes.map(v => {
            const viewName = v.comando.split(".").pop() ?? v.comando;
            const columns = v.dados.length > 0
                ? Object.keys(v.dados[0]).map(key => ({
                    name: key,
                    type: "text",
                    nullable: true,
                    primaryKey: false,
                    description: "",
                }))
                : [];
            return {
                name: viewName,
                description: v.comando,
                columns,
                sampleData: v.dados,
            };
        });

        const expectedOutput = {
            columns: Array.isArray(consulta.colunas) ? consulta.colunas : [],
            rows: Array.isArray(consulta.resultado) ? consulta.resultado : [],
        };

        const mystery: MysteryDetail = {
            ...toMystery(desafio, capitulo.xpRecompensa),
            storyIntro: capitulo.introHistoria,
            storyContext: capitulo.contextoHistoria,
            objectives: objetivos.map(o => o.descricao),
            hints: dicas.map(d => ({
                id: String(d.id),
                order: d.ordem,
                content: d.conteudo,
                xpPenalty: d.penalidadeXp,
            })),
            database: {
                tables,
                relationships: [],
            },
            expectedOutput,
            testCases: [{
                id: String(consulta.id),
                description: "Resultado esperado para a consulta SQL",
                expectedResult: expectedOutput,
                weight: 100,
            }],
        };

        res.status(200).json({ data: mystery });
    });
}

export default new ChallengeController();
