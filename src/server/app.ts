import express, { type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import routes from "./routes/index";
import { setupSwagger } from "./swagger";
import { AppError } from "../service/adapters/errors/api-errors";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json());
app.use(routes);
setupSwagger(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "JSON inválido no corpo da requisição." });
    return;
  }

  console.error("[ErrorHandler]", err);
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";
  res.status(500).json({ error: message });
});

export default app;
