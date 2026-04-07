// src/adapters/controller/capitulo.controller.ts

import { Request, Response } from "express";
import { CapituloUseCase } from "../../core/useCases/capitulo.useCase";
import { CapituloPostgresRepository } from "../repository/postgres/gestao/capitulo.postgres.repository";
import { ApiResponse } from "../../core/domain/http.entity";
import { Capitulo, CapituloView, ObjetivoComConsulta } from "../../core/domain/capitulo.entity";
import { ObjetivoUseCase } from "../../core/useCases/objetivo.useCase";
import { ObjetivoPostgresRepository } from "../repository/postgres/gestao/objetivo.postgres.repository";
import { DicaUseCase } from "../../core/useCases/dica.useCase";
import { DicaPostgresRepository } from "../repository/postgres/gestao/dica.postgres.repository";
import { ConsultaPostgresRepository } from "../repository/postgres/gestao/consulta.postgres.repository";
import { ConsultaUseCase } from "../../core/useCases/consulta.useCase";
import { VisaoUseCase } from "../../core/useCases/visao.useCase";
import { VisaoPostgresRepository } from "../repository/postgres/gestao/visao.postgres.repository";

const capituloUseCase = new CapituloUseCase(new CapituloPostgresRepository());
const objetivoUseCase = new ObjetivoUseCase(new ObjetivoPostgresRepository());
const dicaUseCase = new DicaUseCase(new DicaPostgresRepository());
const consultaUseCase = new ConsultaUseCase(new ConsultaPostgresRepository());
const visaoUseCase = new VisaoUseCase(new VisaoPostgresRepository());
// GET ALL
export const getAll = async (req: Request, res: Response) => {
    try {
        const caps = await capituloUseCase.getAll();
        res.status(200).json(caps);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET BY ID
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const cap = await capituloUseCase.getById(id);
        res.status(200).json(cap);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET Capitulo View (Capitulo & { objetivos: Objetivo[]; dicas: Dica[]; consultaSolucao: Consulta; })
export const getCapituloViewById = async (req: Request, res: Response<ApiResponse<CapituloView>>) => {
    try {
        const capituloId = Number(req.params.id);
        //
        if (isNaN(capituloId)) {
            res.status(400).json({ error: "ID inválido. Deve ser um número." });
            return;
        }
        //
        const capitulo = await capituloUseCase.getById(capituloId);
        //
        const [objetivosRaw, dicas, visaoList] = await Promise.all([
            objetivoUseCase.getByCapituloId(capitulo.id),
            dicaUseCase.getByCapituloId(capitulo.id),
            visaoUseCase.getByCapituloId(capitulo.id),
        ]);
        //
        // Busca a consulta de cada objetivo em paralelo
        const objetivos: ObjetivoComConsulta[] = await Promise.all(
            objetivosRaw.map(async (obj) => {
                const consulta = await consultaUseCase.getByObjetivoId(obj.id);
                if (!consulta) {
                    throw new Error(`Consulta não encontrada para o objetivo ${obj.id}.`);
                }
                return {
                    id: obj.id,
                    idCapitulo: obj.idCapitulo,
                    descricao: obj.descricao,
                    ordem: obj.ordem,
                    nivel: obj.nivel,
                    consulta,
                };
            })
        );
        //
        const visaoTabelas = await Promise.all(
            visaoList.map(async (v, tabelaIdx) => {
                const dados = await visaoUseCase.executeViewById(v.id);
                const nome = v.comando.split(".").pop() ?? v.comando;
                const colunas = dados.length > 0
                    ? Object.keys(dados[0]).map((key, colIdx) => ({
                        id: tabelaIdx * 100 + colIdx + 1,
                        id_tabela: v.id,
                        nome: key,
                        tipo: "text",
                        nulavel: true,
                        chave_primaria: false,
                        descricao: null,
                    }))
                    : [];
                const exemplos = dados.map((row, rowIdx) => ({
                    id: rowIdx + 1,
                    id_tabela: v.id,
                    dados: row,
                }));
                return { id: tabelaIdx + 1, id_visao: v.id, nome, descricao: null, colunas, exemplos };
            })
        );
        //
        res.status(200).json({ data: {
            capitulo,
            objetivos,
            dicas,
            schema: { visaoTabelas, visaoRelacionamentos: [] },
        } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
