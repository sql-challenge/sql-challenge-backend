import { Request, Response } from "express";
import { AdminUseCase } from "../../core/useCases/admin.useCase";
import { AdminFirebaseRepository } from "../repository/firebase/admin.firebase.repository";
import { UserFirebaseRepository } from "../repository/firebase/user.firebase.repository";
import { asyncHandler } from "../middleware/asyncHandler";
import { ValidationError } from "../errors/api-errors";

const adminUseCase = new AdminUseCase(new UserFirebaseRepository(), new AdminFirebaseRepository());

// GET /api/admin/overview?desafioId=
// Visão agregada por aluno (progresso + ciclo de sessão) para o professor.
export const getOverview = asyncHandler(async (req: Request, res: Response) => {
	const raw = req.query.desafioId;
	const desafioId = typeof raw === "string" && raw.length > 0 ? raw : undefined;

	const students = await adminUseCase.getOverview(desafioId);
	res.status(200).json({ data: { desafioId: desafioId ?? null, students } });
});

// GET /api/admin/students/:uid/events?desafioId=&limit=
// Timeline de eventos do aluno (queries rodadas, dicas, objetivos, vitórias).
export const getStudentEvents = asyncHandler(async (req: Request, res: Response) => {
	const uid = req.params.uid;
	if (!uid) throw new ValidationError("uid é obrigatório.");

	const raw = req.query.desafioId;
	const desafioId = typeof raw === "string" && raw.length > 0 ? raw : undefined;

	const limit = req.query.limit != null ? Number(req.query.limit) : 100;
	if (isNaN(limit) || limit < 1) throw new ValidationError("limit deve ser um número positivo.");

	const events = await adminUseCase.getStudentEvents(uid, { desafioId, limit });
	res.status(200).json({ data: { uid, events } });
});

// GET /api/admin/flags?desafioId=
// Atividade suspeita detectada server-side (auditoria anti-forgery).
export const getFlags = asyncHandler(async (req: Request, res: Response) => {
	const raw = req.query.desafioId;
	const desafioId = typeof raw === "string" && raw.length > 0 ? raw : undefined;

	const flags = await adminUseCase.getFlags(desafioId);
	res.status(200).json({ data: { desafioId: desafioId ?? null, flags } });
});
