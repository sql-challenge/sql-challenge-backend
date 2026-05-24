import { Request, Response } from "express";
import { ChapterSessionUseCase } from "../../core/useCases/chapter-session.useCase";
import { ChapterSessionFirebaseRepository } from "../repository/firebase/chapter-session.firebase.repository";
import { emptySession } from "../../core/domain/chapter-session.entity";
import { asyncHandler } from "../middleware/asyncHandler";
import { ValidationError } from "../errors/api-errors";
import { saveSessionSchema } from "../validation/schemas";

const sessionUseCase = new ChapterSessionUseCase(new ChapterSessionFirebaseRepository());

// GET /api/sessions/:uid/:desafioId/:capituloId
export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const { uid, desafioId, capituloId } = req.params;
  const capId = Number(capituloId);

  if (isNaN(capId)) throw new ValidationError("capituloId deve ser um número.");

  const session = await sessionUseCase.getSession(uid, desafioId, capId);
  res.status(200).json({ data: session ?? emptySession(uid, desafioId, capId) });
});

// PATCH /api/sessions/:uid/:desafioId/:capituloId
export const saveSession = asyncHandler(async (req: Request, res: Response) => {
  const { uid, desafioId, capituloId } = req.params;
  const capId = Number(capituloId);

  if (isNaN(capId)) throw new ValidationError("capituloId deve ser um número.");

  const body = saveSessionSchema.parse(req.body);
  const updated = await sessionUseCase.saveSession(uid, desafioId, capId, body);
  res.status(200).json({ data: updated });
});
