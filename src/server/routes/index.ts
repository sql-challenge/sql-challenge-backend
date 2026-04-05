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

const allowedOrigins = [
	"http://localhost:3000",
	process.env.FRONTEND_URL,
].filter((o): o is string => !!o && o !== "undefined");

routes.use(cors({
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);
		const allowed = allowedOrigins.some(o => origin.startsWith(o));
		callback(null, allowed);
	},
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"]
}));

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