# SQL Challenge Backend

Backend API for the SQL Challenge platform — a gamified SQL learning app where users solve database mysteries.

## Tech Stack

- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL (gestão)
- **Auth:** Firebase Auth
- **Container:** Docker

## Architecture

```
src/
├── server/              # Express app + routes
│   ├── app.ts
│   ├── server.ts
│   └── routes/
├── service/
│   ├── core/            # Domain layer
│   │   ├── domain/      # Entities (Desafio, Capitulo, Dica, etc.)
│   │   ├── ports/       # Interfaces (IChallengePort, IUserPort, etc.)
│   │   ├── useCases/    # Use cases
│   │   └── services/    # Services
│   ├── adapters/        # Infrastructure layer
│   │   ├── controller/  # HTTP controllers
│   │   ├── repository/  # PostgreSQL + Firebase repositories
│   │   ├── routes/      # Route definitions
│   │   └── auth/        # Firebase auth adapter
│   ├── db/              # Database configs (PostgreSQL, Firebase)
│   └── mock/            # Mock data (dev only)
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/challenge` | List all challenges |
| `GET` | `/api/challenge/:id` | Get challenge detail |
| `GET` | `/api/user` | List users |
| `POST` | `/api/user` | Register user |
| `POST` | `/api/user/login` | Login |

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Firebase project (for auth)

### Local Development

```bash
# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Fill in your values

# Run in dev mode
npm run dev
```

### Docker

```bash
# Start API + database
docker compose up -d --build

# Check logs
docker compose logs -f api

# Stop
docker compose down

# Stop and wipe database
docker compose down -v
```

## Environment Variables

```bash
# PostgreSQL
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=challenge_pass
POSTGRES_DB=db_gestao_challenge
DB_PORT=5432
DATABASE_URL=postgresql://challenge_user:challenge_pass@db:5432/db_gestao_challenge

# API
PORT=3000

# Firebase
apiKey=
authDomain=
projectId=
storageBucket=
messagingSenderId=
appId=
measurementId=

# CORS
FRONTEND_URL=http://localhost
FRONTEND_PORT=3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled JS (`dist/server/server.js`) |

## Database

The gestão database stores all challenge data:

| Table | Purpose |
|-------|---------|
| `Desafio` | Challenge listing (title, XP, time) |
| `Capitulo` | Challenge detail (story, context) |
| `Objetivo` | Objectives per challenge |
| `Dica` | Hints with XP penalties |
| `Visao` | Database schema container |
| `Visao_Tabela` | Tables in the schema |
| `Visao_Coluna` | Columns per table |
| `Visao_Relacionamento` | Table relationships |
| `Visao_DadoExemplo` | Sample data (JSONB) |
| `Consulta` | Expected query output |
| `Log` | Audit log (auto via triggers) |

The DDL is in `init.sql` and runs automatically on first `docker compose up`.