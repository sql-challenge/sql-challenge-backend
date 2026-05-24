import { Request, Response } from "express";
import { DesafioUseCase } from "../../core/useCases/desafio.useCase";
import { DesafioPostgresRepository } from "../repository/postgres/gestao/desafio.postgres.repository";
import { asyncHandler } from "../middleware/asyncHandler";

const useCase = new DesafioUseCase(new DesafioPostgresRepository());

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await useCase.getAll();
    res.status(200).json({ data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await useCase.getById(id);
    res.status(200).json({ data });
});
