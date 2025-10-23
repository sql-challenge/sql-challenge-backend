import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não encontrada no .env')
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // necessário para Neon
  },
})

// opcional: teste de conexão
pool.connect()
  .then(() => console.log('✅ Conectado ao PostgreSQL com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar ao PostgreSQL:', err))
