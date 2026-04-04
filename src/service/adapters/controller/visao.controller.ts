import { Request, Response } from "express";
import { VisaoUseCase } from "../../core/useCases/visao.useCase";
import { VisaoPostgresRepository } from "../repository/postgres/gestao/visao.postgres.repository";

const visaoUseCase = new VisaoUseCase(new VisaoPostgresRepository());

// GET /visao/
export const getAll = async (req: Request, res: Response) => {
	try {
		const visoes = await visaoUseCase.getAll();
		res.status(200).json(visoes);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// GET /visao/:id
export const getById = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		const visao = await visaoUseCase.getById(id);
		res.status(200).json(visao);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// GET /visao/:id/dados
export const getDados = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		const dados = await visaoUseCase.executeViewById(id);
		res.status(200).json({ data: dados });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
