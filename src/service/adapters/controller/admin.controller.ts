import { Request, Response } from "express";
import { AdminUseCase } from "../../core/useCases/admin.useCase";
import { AdminFirebaseRepository } from "../repository/firebase/admin.firebase.repository";
import { UserFirebaseRepository } from "../repository/firebase/user.firebase.repository";
import { asyncHandler } from "../middleware/asyncHandler";

const adminUseCase = new AdminUseCase(new UserFirebaseRepository(), new AdminFirebaseRepository());

// GET /api/admin/overview?desafioId=
// Visão agregada por aluno (progresso + ciclo de sessão) para o professor.
export const getOverview = asyncHandler(async (req: Request, res: Response) => {
	const raw = req.query.desafioId;
	const desafioId = typeof raw === "string" && raw.length > 0 ? raw : undefined;

	const students = await adminUseCase.getOverview(desafioId);
	res.status(200).json({ data: { desafioId: desafioId ?? null, students } });
});
