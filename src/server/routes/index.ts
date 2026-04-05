import express from "express";
import userRoutes from '../../service/adapters/routes/user.routes'
import rankingRoutes from '../../service/adapters/routes/ranking.routes'
import capituloRoutes from '../../service/adapters/routes/capitulo.routes'
import desafioRoutes from '../../service/adapters/routes/desafio.routes'
import objetivoRoutes from '../../service/adapters/routes/objetivo.routes'
import consultaRoutes from '../../service/adapters/routes/consulta.routes'
import dicaRoutes from '../../service/adapters/routes/dica.routes'
import visaoRoutes from '../../service/adapters/routes/visao.routes'
import cors from "cors";
import challengeRoutes from "../../service/adapters/routes/challenge.routes";

const routes = express();
routes.disable("x-powered-by");
//
routes.use(express.json());
//
// DEVELOPMENT
routes.use(cors({
	origin: "http://localhost:3000", // Permite somente seu frontend
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"]
}));
// PRODUCTION OR STAGING
routes.use(cors({
	origin: `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}`, // Permite somente seu frontend
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"]
}));
// IMPLEMENT LATER

routes.use("/api/user", userRoutes);
routes.use("/api/challenge", challengeRoutes);
// routes.use("/api/ranking", rankingRoutes);
routes.use("/api/capitulo", capituloRoutes);
routes.use("/api/desafios", desafioRoutes);
routes.use("/api/objetivos", objetivoRoutes);
routes.use("/api/consultas", consultaRoutes);
routes.use("/api/dicas", dicaRoutes);
routes.use("/api/visoes", visaoRoutes);

export default routes;