import { Request, Response } from "express";
import { VisaoUseCase } from "../../core/useCases/visao.useCase";
import { VisaoPostgresRepository } from "../repository/postgres/gestao/visao.postgres.repository";
import { asyncHandler } from "../middleware/asyncHandler";

const visaoUseCase = new VisaoUseCase(new VisaoPostgresRepository());

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
	const data = await visaoUseCase.getAll();
	res.status(200).json({ data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
	const id = Number(req.params.id);
	const data = await visaoUseCase.getById(id);
	res.status(200).json({ data });
});

export const getDados = asyncHandler(async (req: Request, res: Response) => {
	const id = Number(req.params.id);
	const dados = await visaoUseCase.executeViewById(id);
	res.status(200).json({ data: dados });
});
