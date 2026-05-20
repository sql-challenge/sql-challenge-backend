import { Request, Response } from "express";
import { ObjetivoUseCase } from "../../core/useCases/objetivo.useCase";
import { ObjetivoPostgresRepository } from "../repository/postgres/gestao/objetivo.postgres.repository";

const useCase = new ObjetivoUseCase(new ObjetivoPostgresRepository());

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await useCase.getAll();
        res.status(200).json({ data });
    } catch (error: unknown) {
        console.error(`[objetivo.controller] getAll:`, (error as Error).name, (error as Error).message, (error as Error).stack);
        res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await useCase.getById(id);
        res.status(200).json({ data });
    } catch (error: unknown) {
        console.error(`[objetivo.controller] getById:`, (error as Error).name, (error as Error).message, (error as Error).stack);
        res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
    }
};
