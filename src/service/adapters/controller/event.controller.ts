import { Request, Response } from "express";
import { EventUseCase } from "../../core/useCases/event.useCase";
import { EventFirebaseRepository } from "../repository/firebase/event.firebase.repository";
import { asyncHandler } from "../middleware/asyncHandler";
import { UnauthorizedError } from "../errors/api-errors";
import { eventBatchSchema } from "../validation/schemas";

const eventUseCase = new EventUseCase(new EventFirebaseRepository());

// POST /api/events — lote de eventos (uid extraído do token, nunca do body)
export const createEvents = asyncHandler(async (req: Request, res: Response) => {
	const uid = req.user?.uid;
	if (!uid) throw new UnauthorizedError("Usuário não autenticado.");

	const body = eventBatchSchema.parse(req.body);
	const received = await eventUseCase.record(uid, body.events);

	// 202 Accepted: ingestão assíncrona por natureza
	res.status(202).json({ data: { received } });
});
