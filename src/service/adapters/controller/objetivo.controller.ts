import { Request, Response } from "express";
import { ObjetivoUseCase } from "../../core/useCases/objetivo.useCase";
import { ObjetivoPostgresRepository } from "../repository/postgres/gestao/objetivo.postgres.repository";
import { asyncHandler } from "../middleware/asyncHandler";

const useCase = new ObjetivoUseCase(new ObjetivoPostgresRepository());

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await useCase.getAll();
    res.status(200).json({ data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await useCase.getById(id);
    res.status(200).json({ data });
});
