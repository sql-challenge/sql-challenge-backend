// src/adapters/controller/capitulo.controller.ts

import { Request, Response } from "express";
import { CapituloUseCase } from "../../core/useCases/capitulo.useCase";
import { CapituloPostgresRepository } from "../repository/postgres/gestao/capitulo.postgres.repository";
import { ApiResponse } from "../../core/domain/http.entity";
import { Capitulo, CapituloView } from "../../core/domain/capitulo.entity";
import { ObjetivoUseCase } from "../../core/useCases/objetivo.useCase";
import { ObjetivoPostgresRepository } from "../repository/postgres/gestao/objetivo.postgres.repository";
import { DicaUseCase } from "../../core/useCases/dica.useCase";
import { DicaPostgresRepository } from "../repository/postgres/gestao/dica.postgres.repository";
import { ConsultaPostgresRepository } from "../repository/postgres/gestao/conuslta.postgres.repository";
import { ConsultaUseCase } from "../../core/useCases/consulta.useCase";

const capituloUseCase = new CapituloUseCase(new CapituloPostgresRepository());
const objetivoUseCase = new ObjetivoUseCase(new ObjetivoPostgresRepository());
const dicaUseCase = new DicaUseCase(new DicaPostgresRepository());
const consultaUseCase = new ConsultaUseCase(new ConsultaPostgresRepository());
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
        const [objetivos, dicas, consultaSolucao] = await Promise.all([
            objetivoUseCase.getByCapituloId(capitulo.id),
            dicaUseCase.getByCapituloId(capitulo.id),
            consultaUseCase.getByCapituloId(capitulo.id),
        ]);
        // 
        if (consultaSolucao.length === 0) {
            res.status(404).json({ error: "Solução esperada (consulta) não encontrada para este capítulo." });
            return;
         }
        //
        res.status(200).json({ data: {
            capitulo,
            objetivos,
            dicas,
            consultaSolucao: consultaSolucao[0],
            schema: {} // TODO: adaptar gestão de schemas de banco, talvez incluir um endpoint específico para isso
        } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
