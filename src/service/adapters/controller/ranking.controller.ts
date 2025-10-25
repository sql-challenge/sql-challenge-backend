import { Request, Response } from "express";
import { RankingUseCase } from "../../core/useCases/ranking.useCase";
import { RankingFirebaseRepository } from "../repository/firebase/ranking.firebase.repository";

const rankingUseCase = new RankingUseCase(new RankingFirebaseRepository());

// GET
export const getAll = async (req: Request, res: Response) => {
	try {
		const rankings = await rankingUseCase.getAll();
		res.status(200).json(rankings);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getRankingByUsername = async (req: Request, res: Response) => {
	try {
		const username = req.params.username;
		const ranking = await rankingUseCase.getRankingByUsername(username);
		res.status(200).json(ranking);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getRankingByNick = async (req: Request, res: Response) => {
	try {
		const nick = req.params.nick;
		const ranking = await rankingUseCase.getRankingByNick(nick);
		res.status(200).json(ranking);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getRankingByPosition = async (req: Request, res: Response) => {
	try {
		const position = Number(req.params.position);
		const ranking = await rankingUseCase.getRankingByPosition(position);
		res.status(200).json(ranking);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// POST
export const addRanking = async (req: Request, res: Response) => {
	try {
		const ranking = req.body;
		const newRanking = await rankingUseCase.addRanking(ranking);
		res.status(201).json(newRanking);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// PUT
export const updatePositionByUsername = async (req: Request, res: Response) => {
	try {
		const username = req.params.username;
		const newPosition = Number(req.params.newPosition);
		const updated = await rankingUseCase.updatePositionByUsername(username, newPosition);
		res.status(200).json(updated);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const updatePositionByNick = async (req: Request, res: Response) => {
	try {
		const nick = req.params.nick;
		const newPosition = Number(req.params.newPosition);
		const updated = await rankingUseCase.updatePositionByNick(nick, newPosition);
		res.status(200).json(updated);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const updateImageByUsername = async (req: Request, res: Response) => {
	try {
		const username = req.params.username;
		const newImage = req.body.newImage;
		const updated = await rankingUseCase.updateImageByUsername(username, newImage);
		res.status(200).json(updated);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const updateImageByNick = async (req: Request, res: Response) => {
	try {
		const nick = req.params.nick;
		const newImage = req.body.newImage;
		const updated = await rankingUseCase.updateImageByNick(nick, newImage);
		res.status(200).json(updated);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// DELETE
export const deleteRanking = async (req: Request, res: Response) => {
	try {
		const username = req.params.username;
		await rankingUseCase.deleteRanking(username);
		res.status(204).send();
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
