import express, { type Request, type Response, type NextFunction } from "express";
import routes from "./routes/index";
import { setupSwagger } from "./swagger";

const app = express();

app.disable("x-powered-by");
app.use(express.json()); // permite JSON no body
app.use(routes);
setupSwagger(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ErrorHandler]", err);
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";
  res.status(500).json({ error: message });
});

export default app;
