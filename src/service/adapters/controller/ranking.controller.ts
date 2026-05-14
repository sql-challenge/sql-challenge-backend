import { Request, Response } from "express";
import { RankingUseCase } from "../../core/useCases/ranking.useCase";
import { RankingFirebaseRepository } from "../repository/firebase/ranking.firebase.repository";

const rankingUseCase = new RankingUseCase(new RankingFirebaseRepository());

// GET
export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await rankingUseCase.getAll();
		res.status(200).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getRankingByUsername = async (req: Request, res: Response) => {
	try {
		const username = req.params.username;
		const data = await rankingUseCase.getRankingByUsername(username);
		res.status(200).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getRankingByNick = async (req: Request, res: Response) => {
	try {
		const nick = req.params.nick;
		const data = await rankingUseCase.getRankingByNick(nick);
		res.status(200).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getRankingByPosition = async (req: Request, res: Response) => {
	try {
		const position = Number(req.params.position);
		const data = await rankingUseCase.getRankingByPosition(position);
		res.status(200).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// POST
export const addRanking = async (req: Request, res: Response) => {
	try {
		const ranking = req.body;
		const data = await rankingUseCase.addRanking(ranking);
		res.status(201).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// PUT
export const updatePositionByUsername = async (req: Request, res: Response) => {
	try {
		const username = req.params.username;
		const newPosition = Number(req.params.newPosition);
		const data = await rankingUseCase.updatePositionByUsername(username, newPosition);
		res.status(200).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const updatePositionByNick = async (req: Request, res: Response) => {
	try {
		const nick = req.params.nick;
		const newPosition = Number(req.params.newPosition);
		const data = await rankingUseCase.updatePositionByNick(nick, newPosition);
		res.status(200).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const updateImageByUsername = async (req: Request, res: Response) => {
	try {
		const username = req.params.username;
		const newImage = req.body.newImage;
		const data = await rankingUseCase.updateImageByUsername(username, newImage);
		res.status(200).json({ data });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const updateImageByNick = async (req: Request, res: Response) => {
	try {
		const nick = req.params.nick;
		const newImage = req.body.newImage;
		const data = await rankingUseCase.updateImageByNick(nick, newImage);
		res.status(200).json({ data });
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
