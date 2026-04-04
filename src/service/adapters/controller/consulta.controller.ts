// src/adapters/controller/consulta.controller.ts

import { Request, Response } from "express";
import { ConsultaUseCase } from "../../core/useCases/consulta.useCase";
import { ConsultaPostgresRepository } from "../repository/postgres/gestao/conuslta.postgres.repository";

// Instância do usecase + repository
const useCase = new ConsultaUseCase(new ConsultaPostgresRepository());

// GET ALL
export const getAll = async (req: Request, res: Response) => {
    try {
        const consultas = await useCase.getAll();
        res.status(200).json(consultas);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET BY ID
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const consulta = await useCase.getById(id);
        res.status(200).json(consulta);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
