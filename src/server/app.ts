import express from "express";
import routes from "./routes/index";

const app = express();

app.disable("x-powered-by");
app.use(express.json()); // permite JSON no body
app.use(routes);

export default app;
