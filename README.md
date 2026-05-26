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
# 1. Instalar dependências
npm install

# 2. Criar .env a partir do exemplo
cp .env.example .env

# 3. Subir PostgreSQL
docker compose up -d db

# 4. Inicializar schemas e dados do jogo
bash scripts/db-init.sh --env production --modelagem ../sql-challenge-modelagem_de_dados

# 5. Iniciar servidor
npm run dev
```

> ⚠️ Atenção: O servidor roda na porta `3002` (não `3000`). A porta `3000` é usada pelo frontend.
> ⚠️ Se o repositório `sql-challenge-modelagem_de_dados` não estiver clonado, veja [Setup manual do banco](#setup-manual-do-banco-sem-db-init) para criar o schema `magical_world` manualmente.

---

## Pré-requisitos

- **Node.js** ≥ 20
- **npm** ≥ 9
- **Docker** + **Docker Compose** (para PostgreSQL)
- **Firebase project** (console.firebase.google.com)
- **Repositório modelagem** (opcional, para db-init.sh):
  ```bash
  git clone https://github.com/sql-challenge/sql-challenge-modelagem_de_dados.git \
    ../sql-challenge-modelagem_de_dados
  ```

---

## Setup Local Passo a Passo

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com seus valores. Veja [Variáveis de ambiente](#variáveis-de-ambiente) para detalhes.

### 2. Banco de dados

```bash
# Sobe o container PostgreSQL
docker compose up -d db

# Verifica se está saudável
docker exec sql-challenge-db pg_isready -U challenge_user -d db_gestao
```

O banco precisa de dois schemas:

**Schema `public`** — tabelas de gestão (Desafio, Capitulo, Objetivo, Dica, Visao, Consulta, Log)

**Schema `magical_world`** — tabelas e views do jogo (Feudo, Pessoa, Cidade, etc.)

#### Via db-init.sh (recomendado)

```bash
# Com o repositório modelagem clonado:
bash scripts/db-init.sh --env production --modelagem ../sql-challenge-modelagem_de_dados
```

#### Setup manual do banco (sem db-init)

```bash
# Schema de gestão
docker exec -i sql-challenge-db psql -U challenge_user -d db_gestao \
  < tests/fixtures/schema.sql

# Tabelas do mundo mágico
docker exec -i sql-challenge-db psql -U challenge_user -d db_gestao \
  -c "SET search_path TO magical_world;" \
  -f <(cat ../sql-challenge-modelagem_de_dados/"Games/magical world/ddl_game.sql")

# Dados do mundo mágico
docker exec -i sql-challenge-db psql -U challenge_user -d db_gestao \
  -c "SET search_path TO magical_world;" \
  -f <(cat ../sql-challenge-modelagem_de_dados/"Games/magical world/dml_game.sql")

# Views do jogo
docker exec -i sql-challenge-db psql -U challenge_user -d db_gestao \
  -c "SET search_path TO magical_world;" \
  -f <(cat ../sql-challenge-modelagem_de_dados/"Games/magical world/vw_ddl_game.sql")

# Conteúdo de gestão (desafios, capítulos, objetivos)
docker exec -i sql-challenge-db psql -U challenge_user -d db_gestao \
  < tests/fixtures/data.sql
```

### 3. Firebase

#### Cliente SDK (frontend)

Crie um projeto no [Firebase Console](https://console.firebase.google.com). Em **Configurações do projeto > Geral > Seus apps > Web**, copie as credenciais para o `.env`:

```env
apiKey=AIza...
authDomain=seu-projeto.firebaseapp.com
projectId=seu-projeto
storageBucket=seu-projeto.appspot.com
messagingSenderId=123456789
appId=1:123456789:web:abc123
measurementId=G-XXXXXXXX
```

#### Admin SDK (backend — service account)

O backend lê as credenciais Admin diretamente das variáveis de ambiente no `.env`:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
```

> A `FIREBASE_PRIVATE_KEY` deve conter `\n` literais (escape sequences) dentro das aspas duplas. O backend faz `privateKey.replace(/\\n/g, "\n")` automaticamente.

1. No Firebase Console, vá em **Configurações do projeto > Contas de serviço > SDK Admin**
2. Clique em **Gerar nova chave privada**
3. Copie o `client_email` e a `private_key` do JSON baixado para o `.env`
4. O servidor exibirá no log:
   ```
   [Firebase Admin] Inicializado com credenciais do .env
   ```

> Sem as credenciais, o Admin SDK inicializa sem service account e endpoints como ranking (que usam `orderBy`/`get()` no Firestore) podem falhar ou retornar dados vazios. Considere também que o backend não implementa fallback REST — usa Admin SDK diretamente.

### 4. Rodar o servidor

```bash
npm run dev
```

Acesse `http://localhost:3002/api/health`.

---

## Variáveis de ambiente

```env
# ─── Environment ─────────────────────────────
NODE_ENV=development

# ─── Database ─────────────────────────────────
DATABASE_URL=postgresql://challenge_user:challenge_pass@localhost:5432/db_gestao?sslmode=disable

# ─── API ──────────────────────────────────────
PORT=3002

# ─── Firebase Client (obrigatório) ────────────
apiKey=your-api-key
authDomain=your-project.firebaseapp.com
projectId=your-project-id
storageBucket=your-project.appspot.com
messagingSenderId=your-sender-id
appId=your-app-id
measurementId=G-XXXXXXXXXX

# ─── Firebase Admin (opcional, mas recomendado) ─
# O backend lê FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY diretamente do .env
# (não usa arquivo JSON separado). A private key deve ter \n literais na string.
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"

# ─── CORS / Frontend ─────────────────────────
FRONTEND_URL=http://localhost:3000

# ─── Email (Nodemailer — opcional) ───────────
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ─── URLs ────────────────────────────────────
SITE_URL=http://localhost:3000
```

---

## API Endpoints

| Method | Route | Descrição |
|--------|-------|-----------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/user` | Lista usuários |
| ~~`POST`~~ | ~~`/api/user`~~ | ~~Cadastrar usuário~~ (desabilitado — usar `/api/user/auth/oauth`) |
| `POST` | `/api/user/auth/oauth` | Login OAuth (Google/GitHub) |
| `GET` | `/api/user/token/valid` | Valida token JWT |
| `GET` | `/api/user/top` | Ranking por XP |
| `GET` | `/api/user/:uid` | Perfil do usuário |
| `GET` | `/api/user/token/valid` | Valida token JWT e retorna dados do usuário |
| `PUT` | `/api/user/` | Atualizar perfil |
| `GET` | `/api/desafios/` | Lista desafios |
| `GET` | `/api/desafios/:id` | Detalhe do desafio |
| `GET` | `/api/capitulo/` | Lista capítulos |
| `GET` | `/api/capitulo/view/:id` | Capítulo com objetivos, dicas e schema |
| `GET` | `/api/sessions/:uid/:desafioId/:capituloId` | Sessão do capítulo |
| `POST` | `/api/sessions/:uid/:desafioId/:capituloId` | Salvar sessão |

---

## Arquitetura

```
src/
├── server/              # Express app + rotas principais
│   ├── app.ts
│   ├── server.ts
│   └── routes/
└── service/
    ├── core/            # Camada de domínio
    │   ├── domain/      # Entidades (Desafio, Capitulo, Dica...)
    │   ├── ports/       # Interfaces (IChallengePort, IUserPort...)
    │   ├── useCases/    # Casos de uso
    │   └── services/    # Serviços
    └── adapters/        # Camada de infraestrutura
        ├── controller/  # Controllers HTTP
        ├── repository/  # Repositórios PostgreSQL + Firebase
        ├── routes/      # Definição de rotas
        └── auth/        # Adaptador Firebase Auth
```

### Firebase — modo de operação único

O backend usa o **Admin SDK** do Firebase (`firebase-admin`) diretamente, sem fallback REST. As credenciais são lidas do `.env` (`FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`).

Se as credenciais não estiverem configuradas, o Admin SDK inicializa sem service account — queries como `orderBy("xp", "desc")` no Firestore podem retornar erro de permissão.

> ⚠️ Diferente de versões anteriores do código, não existe mais `compatFirestore`/`withFallback`/REST fallback. Todo acesso ao Firestore passa pelo Admin SDK.

### Banco de dados — dois schemas

O PostgreSQL contém dois schemas no mesmo banco `db_gestao`:

**Schema `public`** (tabelas de gestão):
| Tabela | Propósito |
|--------|-----------|
| `Desafio` | Desafios disponíveis (título, XP, tempo estimado) |
| `Capitulo` | Capítulos narrativos de cada desafio |
| `Objetivo` | Tarefas SQL a completar |
| `Dica` | Dicas com penalidade de XP |
| `Visao` | Referências a views do `magical_world` para exibir schema |
| `Consulta` | Resposta esperada para cada objetivo |
| `Log` | Auditoria automática via triggers |

**Schema `magical_world`** (dados do jogo):
| Tabela | Propósito |
|--------|-----------|
| `Feudo`, `Pessoa`, `Cidade` | Entidades principais do mundo |
| `Artefato`, `Posse_Artefatos` | Sistema de itens |
| `AcademiaMagica`, `Torres_Magicas` | Facções |
| `Ataques`, `Aliados_Politicos` | Eventos e relações |

Views (19 no total) — `regioes_reinos`, `pessoas_vivas`, `senhores_das_terras`, `ataques_raw`, `grimorio_final`, etc.

A pool do PostgreSQL já inclui `search_path=public,magical_world` no `postgresqlConfig.ts`, então tabelas e views de ambos os schemas são acessíveis sem prefixo.

---

## Docker local

```bash
# API + banco de dados
docker compose up -d --build

# Apenas banco
docker compose up -d db

# Ver logs
docker compose logs -f api

# Parar
docker compose down

# Parar e apagar dados do banco
docker compose down -v
```

---

## Testes

```bash
# Todos os testes
npm test

# Por tipo
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security

# Com cobertura
npm run test:coverage
```

Os testes de integração/e2e precisam de PostgreSQL rodando:

```bash
docker compose -f docker-compose.staging.yml up -d db-staging
```

Veja [`tests/TESTES.md`](./tests/TESTES.md) para detalhes.

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server com nodemon (`.env`) |
| `npm run dev:local` | Dev server com `.env.local` |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar servidor compilado |
| `npm test` | Todos os testes |
| `npm run test:unit` | Testes unitários |
| `npm run test:integration` | Testes de integração |
| `npm run test:e2e` | Testes end-to-end |
| `npm run test:security` | Testes de segurança |
| `npm run test:coverage` | Cobertura de código |

---

## Setup do servidor (produção)

> O setup completo da VPS é feito pelo script do frontend.
> Veja [sql-challenge-frontend/scripts/setup-server.sh](https://github.com/sql-challenge/sql-challenge-frontend/blob/main/scripts/setup-server.sh).

### GitHub Secrets (neste repositório)

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` | IP da VPS |
| `VPS_PORT` | Porta SSH (`2222`) |
| `VPS_USER` | Usuário SSH (`admin`) |
| `VPS_SSH_KEY` | Chave privada Ed25519 |
| `POSTGRES_USER` | Usuário PostgreSQL |
| `POSTGRES_PASSWORD` | Senha PostgreSQL |
| `FB_API_KEY` | Firebase API Key |
| `FB_AUTH_DOMAIN` | Firebase Auth Domain |
| `FB_PROJECT_ID` | Firebase Project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin Client Email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin Private Key (com `\n` literais) |

### Comandos úteis na VPS

```bash
# Ver containers rodando
docker ps

# Logs do backend
docker compose -f ~/sql-challenge-backend/docker-compose.yml logs -f api

# Conectar ao banco
docker compose -f ~/sql-challenge-backend/docker-compose.yml exec db \
  psql -U challenge_user -d db_gestao
```

---

## db-init.sh — Script de inicialização do banco

O script `scripts/db-init.sh` gerencia a criação e inicialização completa dos bancos de produção e staging.

```bash
# Inicializa ambos (produção + staging)
bash scripts/db-init.sh

# Só produção
bash scripts/db-init.sh --env production --modelagem ../sql-challenge-modelagem_de_dados

# Só staging
bash scripts/db-init.sh --env staging

# Reset completo (⚠️ APAGA TODOS OS DADOS)
bash scripts/db-init.sh --env production --reset
```

### Ordem de execução — banco de produção

| Passo | Arquivo | O que faz |
|-------|---------|-----------|
| 1/6 | `tests/fixtures/schema.sql` | Tabelas de gestão + schema `magical_world` vazio |
| 2/6 | `Games/magical world/ddl_game.sql` | Tabelas do jogo (Feudo, Pessoa, Artefato, etc.) |
| 3/6 | `Games/magical world/dml_game.sql` | Dados das entidades do jogo |
| 4/6 | `Games/magical world/vw_ddl_game.sql` | Views por capítulo (19 views) |
| 5/6 | `PostgreSQL/Script/cadastro_games/dml_magical_world.sql` | Conteúdo de gestão (desafio, capítulos) |
| 6/6 | `PostgreSQL/Script/gestão/dcl_security.sql` | Usuário `users_sql_challenge` (somente leitura) |
