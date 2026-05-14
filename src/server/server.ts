import app from "./app";
import dotenv from "dotenv";
import { pool } from "../service/db/postgresql/postgresqlConfig";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} recebido, iniciando desligamento...`);
  server.close(() => {
    console.log("Servidor HTTP fechado.");
  });
  try {
    await pool.end();
    console.log("Pool PostgreSQL encerrado.");
  } catch (err) {
    console.error("Erro ao encerrar pool PostgreSQL:", err);
  }
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
