import { Request, Response } from "express";
import { DesafioUseCase } from "../../core/useCases/desafio.useCase";
import { DesafioPostgresRepository } from "../repository/postgres/gestao/desafio.postgres.repository";

const useCase = new DesafioUseCase(new DesafioPostgresRepository());

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await useCase.getAll();
        res.status(200).json({ data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await useCase.getById(id);
        res.status(200).json({ data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
