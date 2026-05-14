import { Request, Response } from "express";
import { DicaUseCase } from "../../core/useCases/dica.useCase";
import { DicaPostgresRepository } from "../repository/postgres/gestao/dica.postgres.repository";

const useCase = new DicaUseCase(new DicaPostgresRepository());

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await useCase.getAll();
        res.status(200).json({ data });
    } catch (error: unknown) {
        res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await useCase.getById(id);
        res.status(200).json({ data });
    } catch (error: unknown) {
        res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
    }
};

export const getByCapituloId = async (req: Request, res: Response) => {
    try {
        const idCapitulo = Number(req.params.idCapitulo);
        const data = await useCase.getByCapituloId(idCapitulo);
        res.status(200).json({ data });
    } catch (error: unknown) {
        res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
    }
};
