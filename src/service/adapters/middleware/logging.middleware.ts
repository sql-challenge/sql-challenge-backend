import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
	const requestId = crypto.randomUUID().slice(0, 8);
	(req as any).requestId = requestId;

	const start = Date.now();
	const { method, originalUrl } = req;

	res.on("finish", () => {
		const duration = Date.now() - start;
		const { statusCode } = res;
		const user = (req as any).user?.uid ?? "-";
		console.log(`[${requestId}] ${method} ${originalUrl} ${statusCode} ${duration}ms user=${user}`);
	});

	next();
}
