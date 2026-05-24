import { Request, Response } from "express";
import { DicaUseCase } from "../../core/useCases/dica.useCase";
import { DicaPostgresRepository } from "../repository/postgres/gestao/dica.postgres.repository";
import { asyncHandler } from "../middleware/asyncHandler";

const useCase = new DicaUseCase(new DicaPostgresRepository());

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await useCase.getAll();
    res.status(200).json({ data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await useCase.getById(id);
    res.status(200).json({ data });
});

export const getByCapituloId = asyncHandler(async (req: Request, res: Response) => {
    const idCapitulo = Number(req.params.idCapitulo);
    const data = await useCase.getByCapituloId(idCapitulo);
    res.status(200).json({ data });
});
