import express from "express";
import routes from "./routes/index";
import { setupSwagger } from "./swagger";

const app = express();

app.disable("x-powered-by");
app.use(express.json()); // permite JSON no body
app.use(routes);
setupSwagger(app);

export default app;
