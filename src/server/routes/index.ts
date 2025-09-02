import express from "express";
import userRoutes from '../../service/adapters/routes/user.routes'

import cors from "cors";

const routes = express();

// DEVELOPMENT
routes.use(cors({
	origin: "http://localhost:5173", // Permite somente seu frontend
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"]
}));

routes.use(express.json());
// PRODUCTION
// IMPLEMENT LATER

routes.use("/api/user", userRoutes)

export default routes;