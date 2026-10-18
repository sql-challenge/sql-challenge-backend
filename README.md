# SQL Challenge — Backend

API backend do SQL Challenge: plataforma gamificada de aprendizado de SQL onde usuários resolvem mistérios de banco de dados.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express 5 |
| Banco de dados | PostgreSQL 16 |
| Auth | Firebase Auth + Admin SDK |
| Container | Docker (multi-stage) |
| Testes | Jest |
| Docs | Swagger/OpenAPI |

## Quick Start (primeira vez)

```bash
# 1. Pré-requisito: repositório modelagem clonado ao lado (fonte do banco)
git clone https://github.com/sql-challenge/sql-challenge-modelagem_de_dados.git \
  ../sql-challenge-modelagem_de_dados

# 2. Dependências + env de dev
npm install
cp .env.development.example .env

# 3. Banco de dev (sobe o PostgreSQL + semeia o pipeline do modelagem)
bash scripts/db-dev.sh up

# 4. Servidor
npm run dev        # http://localhost:3002/api/health
```

> ⚠️ O servidor roda na porta **3002** (a 3000 é do frontend).
> 📖 Guia completo de desenvolvimento (Firebase emuladores, banco, testes,
> troubleshooting): **[DEVELOPMENT.md](./DEVELOPMENT.md)**.
> 🚀 Deploy (Docker, K8s, VPS, db-init): **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## Firebase (credenciais)

Em **dev** os emuladores locais substituem o Firebase real (`npm run emulators`)
e nenhuma credencial de nuvem é necessária. Para apontar a um projeto real:

**Cliente SDK** (console → Configurações do projeto → Seus apps → Web):

```env
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

**Admin SDK** (service account — console → Configurações → Contas de serviço):

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
```

> A `FIREBASE_PRIVATE_KEY` deve ter `\n` literais (escape) dentro das aspas —
> o backend faz `replace(/\\n/g, "\n")` automaticamente.
>
> ⚠️ **Sem as credenciais Admin**, endpoints que usam o Firestore **completam
> mas retornam vazio** em produção (ranking, dashboard do professor, revogação
> de tokens). O backend usa o Admin SDK direto, sem fallback REST.

---

## Variáveis de ambiente

Referência do `.env` (backend). Template: [`.env.development.example`](./.env.development.example).

```env
# ─── Environment ─────────────────────────────
NODE_ENV=development

# ─── Database ─────────────────────────────────
DATABASE_URL=postgresql://challenge_user:challenge_pass@localhost:5432/db_gestao_dev?sslmode=disable

# ─── API ──────────────────────────────────────
PORT=3002
FRONTEND_URL=http://localhost:3000   # CORS

# ─── Firebase (ver seção acima) ──────────────
FIREBASE_PROJECT_ID=demo-sql-challenge   # em dev: o projeto demo dos emuladores
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."

# ─── Emuladores (dev) ─────────────────────────
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080

# ─── Professor / admin ────────────────────────
ADMIN_EMAILS=professor@escola.com        # allowlist do /admin (vírgula separa vários)
TRUST_PROXY=true                          # habilita X-Forwarded-For atrás de proxy/nginx

# ─── Email (Nodemailer — opcional) ───────────
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## API Endpoints

Todas as rotas autenticadas exigem `Authorization: Bearer <idToken>` (Firebase).

| Method | Route | Descrição |
|--------|-------|-----------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/user/auth/oauth` | Login OAuth (Google/GitHub) — público |
| `GET` | `/api/user/token/valid` | Valida token e retorna o usuário |
| `GET` | `/api/user/uid/:uid` | Perfil (apenas o próprio uid) |
| `PUT` | `/api/user/` | Atualiza perfil (nick/username/avatar) |
| `POST` | `/api/user/:uid/progress` | Progresso do desafio (XP/XP, validação de teto) |
| `GET` | `/api/user/top` | Ranking por XP (projeção pública) |
| `GET` | `/api/desafios/` | Lista desafios |
| `GET` | `/api/capitulo/view/:id` | Capítulo com objetivos, dicas e schema |
| `GET/POST/PATCH` | `/api/sessions/:uid/:desafioId/:capituloId` | Sessão do capítulo (restauração/save) |
| `POST` | `/api/events` | Ingestão de telemetria (lote ≤25) |
| `GET` | `/api/admin/overview` · `/api/admin/flags` · `/api/admin/students/:uid/events` | Painel do professor (allowlist `ADMIN_EMAILS`) |

Documentação completa (Swagger): `http://localhost:3002/api-docs` com o servidor no ar.

---

## Arquitetura

Arquitetura hexagonal — `service/core` (domínio) não conhece Express/Postgres/Firebase; os `adapters` implementam as `ports`:

```
src/
├── server/              # Express app + rotas principais
└── service/
    ├── core/
    │   ├── domain/      # Entidades
    │   ├── ports/       # Interfaces dos repositórios
    │   └── useCases/    # Casos de uso
    └── adapters/        # Controllers, repositórios (Postgres/Firebase), middleware, rotas
```

### Banco de dados — dois schemas

O PostgreSQL contém dois schemas no mesmo banco:

- **`public`** (gestão): `Desafio`, `Capitulo`, `Objetivo`, `Dica`, `Visao`, `Consulta`, `Log`. A tabela `Consulta` guarda a **resposta esperada** de cada objetivo e `Log` é auditada por triggers.
- **`magical_world`** (jogo): `Feudo`, `Pessoa`, `Cidade`, `Artefato`, `AcademiaMagica`, `Torres_Magicas`, `Ataques`, ... + views jogáveis (uma por objetivo).

A pool já inclui `search_path=public,magical_world` — sem prefixos no código.
Contrato e pipeline: [DATABASE.md do modelagem](https://github.com/sql-challenge/sql-challenge-modelagem_de_dados/blob/merge/facundes-main/DATABASE.md).

---

## Testes

```bash
npm test          # todas as suítes
```

Suítes (unit/integration/e2e/security), comandos individuais,
pré-requisitos e o que cada uma cobre: **[`tests/TESTES.md`](./tests/TESTES.md)**.
E2E de UI (Playwright, do monorepo): [tests/e2e](https://github.com/sql-challenge/sql-challenge-monorepo/tree/main/tests/e2e).

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server com nodemon (`.env`) |
| `npm run dev:local` | Dev server com `.env.local` |
| `npm run emulators` | Firebase local (Auth 9099 · Firestore 8080 · UI 4000) |
| `npm run build` / `npm start` | Build TypeScript / servidor compilado |
| `npm run test:*` | Suítes de teste (ver acima) |
| `bash scripts/db-dev.sh up\|reseed\|psql\|status\|down` | Banco de dev |
| `bash scripts/db-init.sh` | Banco de staging/produção (ver [DEPLOYMENT.md](./DEPLOYMENT.md)) |

---

## Deploy

Docker Compose (VPS), Kubernetes (K3s) e a inicialização de banco de
staging/produção estão em **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## Licença

MIT
