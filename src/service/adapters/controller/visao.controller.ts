import { Request, Response } from "express";
import { VisaoUseCase } from "../../core/useCases/visao.useCase";
import { VisaoPostgresRepository } from "../repository/postgres/gestao/visao.postgres.repository";

const visaoUseCase = new VisaoUseCase(new VisaoPostgresRepository());

// GET /visao/
export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await visaoUseCase.getAll();
		res.status(200).json({ data });
	} catch (error: unknown) {
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// GET /visao/:id
export const getById = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		const data = await visaoUseCase.getById(id);
		res.status(200).json({ data });
	} catch (error: unknown) {
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};

// GET /visao/:id/dados
export const getDados = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		const dados = await visaoUseCase.executeViewById(id);
		res.status(200).json({ data: dados });
	} catch (error: unknown) {
		res.status(500).json({ error: `[API] ${error instanceof Error ? error.message : "Unknown error"}` });
	}
};
