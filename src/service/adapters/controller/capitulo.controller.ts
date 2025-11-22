// src/adapters/controller/capitulo.controller.ts

import { Request, Response } from "express";
import { CapituloUseCase } from "../../core/useCases/capitulo.useCase";
import { CapituloPostgresRepository } from "../repository/postgres/capitulo.postgres.repository";

const useCase = new CapituloUseCase(new CapituloPostgresRepository());

// GET ALL
export const getAll = async (req: Request, res: Response) => {
    try {
        const caps = await useCase.getAll();
        res.status(200).json(caps);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET BY ID
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const cap = await useCase.getById(id);
        res.status(200).json(cap);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
