import { Request, Response } from "express";
import { RankingUseCase } from "../../core/useCases/ranking.useCase";
import { RankingFirebaseRepository } from "../repository/firebase/ranking.firebase.repository";
import { asyncHandler } from "../middleware/asyncHandler";
import { ValidationError } from "../errors/api-errors";
import { addRankingSchema, updateRankingImageSchema } from "../validation/schemas";

const rankingUseCase = new RankingUseCase(new RankingFirebaseRepository());

// GET
export const getAll = asyncHandler(async (_req: Request, res: Response) => {
	const data = await rankingUseCase.getAll();
	res.status(200).json({ data });
});

export const getRankingByUsername = asyncHandler(async (req: Request, res: Response) => {
	const username = req.params.username;
	const data = await rankingUseCase.getRankingByUsername(username);
	res.status(200).json({ data });
});

export const getRankingByNick = asyncHandler(async (req: Request, res: Response) => {
	const nick = req.params.nick;
	const data = await rankingUseCase.getRankingByNick(nick);
	res.status(200).json({ data });
});

export const getRankingByPosition = asyncHandler(async (req: Request, res: Response) => {
	const position = Number(req.params.position);
	if (isNaN(position) || position < 1) throw new ValidationError("position deve ser um número positivo.");
	const data = await rankingUseCase.getRankingByPosition(position);
	res.status(200).json({ data });
});

// POST
export const addRanking = asyncHandler(async (req: Request, res: Response) => {
	const body = addRankingSchema.parse(req.body);
	const data = await rankingUseCase.addRanking({
		...body,
		imagePerfil: body.imagePerfil ?? "",
	});
	res.status(201).json({ data });
});

// PUT
export const updatePositionByUsername = asyncHandler(async (req: Request, res: Response) => {
	const username = req.params.username;
	const newPosition = Number(req.params.newPosition);
	if (isNaN(newPosition) || newPosition < 0) throw new ValidationError("newPosition inválido.");
	const data = await rankingUseCase.updatePositionByUsername(username, newPosition);
	res.status(200).json({ data });
});

export const updatePositionByNick = asyncHandler(async (req: Request, res: Response) => {
	const nick = req.params.nick;
	const newPosition = Number(req.params.newPosition);
	if (isNaN(newPosition) || newPosition < 0) throw new ValidationError("newPosition inválido.");
	const data = await rankingUseCase.updatePositionByNick(nick, newPosition);
	res.status(200).json({ data });
});

export const updateImageByUsername = asyncHandler(async (req: Request, res: Response) => {
	const username = req.params.username;
	const { newImage } = updateRankingImageSchema.parse(req.body);
	const data = await rankingUseCase.updateImageByUsername(username, newImage);
	res.status(200).json({ data });
});

export const updateImageByNick = asyncHandler(async (req: Request, res: Response) => {
	const nick = req.params.nick;
	const { newImage } = updateRankingImageSchema.parse(req.body);
	const data = await rankingUseCase.updateImageByNick(nick, newImage);
	res.status(200).json({ data });
});

// DELETE
export const deleteRanking = asyncHandler(async (req: Request, res: Response) => {
	const username = req.params.username;
	await rankingUseCase.deleteRanking(username);
	res.status(204).send();
});
