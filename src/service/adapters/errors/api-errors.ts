export class AppError extends Error {
	constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Recurso não encontrado") {
		super(404, message);
	}
}

export class ValidationError extends AppError {
	constructor(message = "Dados inválidos") {
		super(400, message);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Acesso negado") {
		super(403, message);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Não autorizado") {
		super(401, message);
	}
}
