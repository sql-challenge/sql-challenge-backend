import { Request, Response } from "express";
import { ChapterSessionUseCase } from "../../core/useCases/chapter-session.useCase";
import { ChapterSessionFirebaseRepository } from "../repository/firebase/chapter-session.firebase.repository";
import { emptySession, SaveSessionDto } from "../../core/domain/chapter-session.entity";

const sessionUseCase = new ChapterSessionUseCase(new ChapterSessionFirebaseRepository());

// GET /api/sessions/:uid/:desafioId/:capituloId
export const getSession = async (req: Request, res: Response) => {
  try {
    const { uid, desafioId, capituloId } = req.params;
    const capId = Number(capituloId);

    if (isNaN(capId)) {
      res.status(400).json({ error: "capituloId deve ser um número." });
      return;
    }

    const session = await sessionUseCase.getSession(uid, desafioId, capId);
    res.status(200).json({ data: session ?? emptySession(uid, desafioId, capId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/sessions/:uid/:desafioId/:capituloId
export const saveSession = async (req: Request, res: Response) => {
  try {
    const { uid, desafioId, capituloId } = req.params;
    const capId = Number(capituloId);

    if (isNaN(capId)) {
      res.status(400).json({ error: "capituloId deve ser um número." });
      return;
    }

    const dto: SaveSessionDto = {
      elapsedSeconds: Number(req.body.elapsedSeconds) || 0,
      currentObjetivoIndex: Number(req.body.currentObjetivoIndex) ?? 0,
      completedObjetivos: Array.isArray(req.body.completedObjetivos) ? req.body.completedObjetivos : [],
      hintsRevealed: Array.isArray(req.body.hintsRevealed) ? req.body.hintsRevealed : [],
      isClosing: Boolean(req.body.isClosing),
    };

    const updated = await sessionUseCase.saveSession(uid, desafioId, capId, dto);
    res.status(200).json({ data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
