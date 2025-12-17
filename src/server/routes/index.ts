import express from "express";
import userRoutes from '../../service/adapters/routes/user.routes'
import rankingRoutes from '../../service/adapters/routes/ranking.routes'
import capituloRoutes from '../../service/adapters/routes/capitulo.routes'

import cors from "cors";

const routes = express();
//
routes.use(express.json());
//
// DEVELOPMENT
// routes.use(cors({
// 	origin: "http://localhost:3000", // Permite somente seu frontend
// 	methods: ["GET", "POST", "PUT", "DELETE"],
// 	allowedHeaders: ["Content-Type", "Authorization"]
// }));
//
// PRODUCTION
routes.use(cors({
	// TODO: force https in production, thinking
	origin: `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}`, // Permite somente seu frontend
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"]
}));
// IMPLEMENT LATER

routes.use("/api/user", userRoutes);
// routes.use("/api/ranking", rankingRoutes);
// routes.use("/api/capitulos", capituloRoutes);

export default routes;