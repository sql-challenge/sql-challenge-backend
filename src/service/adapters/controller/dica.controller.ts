import { Request, Response } from "express";
import { DicaUseCase } from "../../core/useCases/dica.useCase";
import { DicaPostgresRepository } from "../repository/postgres/dica.postgres.repository";

const useCase = new DicaUseCase(new DicaPostgresRepository());

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

export const getByCapituloId = async (req: Request, res: Response) => {
    try {
        const idCapitulo = Number(req.params.idCapitulo);
        const list = await useCase.getByCapituloId(idCapitulo);
        res.status(200).json(list);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
