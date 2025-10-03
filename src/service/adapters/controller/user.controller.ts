import { Request, Response } from "express";
import { UserUseCase } from "../../core/useCases/user.useCase";
import { UserFirebaseRepository } from "../repository/firebase/user.firebase.repository";

const userUseCase = new UserUseCase(new UserFirebaseRepository());

// GET
export const getAll = async (req: Request, res: Response) => {
	try {
		const users = await userUseCase.getAll();
		res.status(200).json(users);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getUserByUID = async (req: Request, res: Response) => {
	try {
		const uid= req.params.uid;
		const user = await userUseCase.getUserByUID(uid);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getUsersByName = async (req: Request, res: Response) => {
	try {
		const name = req.params.name;
		const users = await userUseCase.getUsersByName(name);
		res.status(200).json(users);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getUserByEmail = async (req: Request, res: Response) => {
	try {
		const email = req.params.email;
		const user = await userUseCase.getUserByEmail(email);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// POST
export const addUser = async (req: Request, res: Response) => {
	try {
		const user = req.body;
		const newUser = await userUseCase.addUser(user);
		res.status(201).json(newUser);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const addUserbyGoogle = async (req: Request, res: Response) => {
	try {
		const idToken = req.params.token
		const newUser = await userUseCase.addUserbyGoogle(idToken);
		res.status(201).json(newUser);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const loginWithEmail = async (req: Request, res: Response) => {
	try {
		const body = req.body
		const newUser = await userUseCase.loginWithEmail(body.email, body.password);
		res.status(201).json(newUser);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const loginWithGoogle = async (req: Request, res: Response) => {
	try {
		const idToken = req.params.token
		const newUser = await userUseCase.loginWithGoogle(idToken);
		res.status(201).json(newUser);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid
		await userUseCase.logout(uid);
		res.status(201).json();
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const uid = req.params.uid
		const newPsw = req.params.newPsw
		await userUseCase.resetPassword(uid, newPsw);
		res.status(201).json();
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// PUT
export const updateUser = async (req: Request, res: Response) => {
	try {
		const user = req.body;
		const updatedUser = await userUseCase.updateUser(user);
		res.status(200).json(updatedUser);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const uid= req.params.uid;
		await userUseCase.deleteUser(uid);
		res.status(204).send();
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
