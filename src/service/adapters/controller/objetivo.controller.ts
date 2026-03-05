import { Request, Response } from "express";
import { ObjetivoUseCase } from "../../core/useCases/objetivo.useCase";
import { ObjetivoPostgresRepository } from "../repository/postgres/gestao/objetivo.postgres.repository";

const useCase = new ObjetivoUseCase(new ObjetivoPostgresRepository());

export const getAll = async (req: Request, res: Response) => {
    try {
        const list = await useCase.getAll();
        res.status(200).json(list);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const item = await useCase.getById(id);
        res.status(200).json(item);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
