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

## API Endpoints

| Method | Route | Descrição |
|--------|-------|-----------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/challenge` | Lista todos os desafios |
| `GET` | `/api/challenge/:id` | Detalhe de um desafio |
| `GET` | `/api/user` | Lista usuários |
| `POST` | `/api/user` | Cadastrar usuário |
| `POST` | `/api/user/login` | Login |

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Criar variáveis de ambiente
cp .env.example .env.local
# edite com seus valores

# Iniciar em modo dev (com hot-reload)
npm run dev:local

# Build TypeScript
npm run build

# Iniciar produção (após build)
npm start
```

### Variáveis de ambiente

```env
# PostgreSQL
POSTGRES_USER=challenge_user
POSTGRES_PASSWORD=challenge_pass
POSTGRES_DB=db_gestao
DB_PORT=5432
DATABASE_URL=postgresql://challenge_user:challenge_pass@db:5432/db_gestao?sslmode=disable

# API
PORT=3000
NODE_ENV=development

# Firebase Client SDK
apiKey=
authDomain=
projectId=
storageBucket=
messagingSenderId=
appId=
measurementId=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# CORS
FRONTEND_URL=http://localhost
FRONTEND_PORT=3000

# Email
EMAIL_USER=
EMAIL_PASS=
SITE_URL=
```

## Docker local

```bash
# API + banco de dados
docker compose up -d --build

# Ver logs
docker compose logs -f api

# Parar
docker compose down

# Parar e apagar dados do banco
docker compose down -v
```

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

Os testes de integração/e2e precisam de PostgreSQL rodando com o banco inicializado:

```bash
# O banco de testes é inicializado automaticamente via docker-compose.staging.yml
# com os fixtures de tests/fixtures/
docker compose -f docker-compose.staging.yml up -d db-staging
```

## Script de banco de dados

O script `scripts/db-init.sh` gerencia a criação e inicialização completa dos dois bancos.

### Uso

```bash
# Inicializa ambos (produção + staging)
bash scripts/db-init.sh

# Só produção
bash scripts/db-init.sh --env production

# Só staging
bash scripts/db-init.sh --env staging

# Repositório modelagem em caminho personalizado
bash scripts/db-init.sh --modelagem /home/admin/sql-challenge-modelagem_de_dados

# Reset completo (⚠️ APAGA TODOS OS DADOS)
bash scripts/db-init.sh --env production --reset
bash scripts/db-init.sh --env staging --reset
```

### Ordem de execução — banco de produção (`db_gestao`)

| Passo | Arquivo | O que faz |
|-------|---------|-----------|
| 1/7 | `tests/fixtures/schema.sql` | Tabelas de gestão (Desafio, Capitulo, Objetivo, Dica, Visao, Consulta, Log) + triggers + schema `magical_world` vazio |
| 2/7 | `Games/magical world/ddl_game.sql` | Tabelas do mundo mágico (Feudo, Pessoa, Artefato, Cidade, Torres, etc.) |
| 3/7 | `Games/magical world/dml_gama.sql` | Dados das entidades do jogo (feudos, pessoas, artefatos, cidades…) |
| 4/7 | `Games/magical world/dml_gama_patch.sql` | Patches de dados (categorias, proprietários, Val'Nareth, vw_Pistas_Decifradas) |
| 5/7 | `Games/magical world/vw_ddl_game.sql` | Views por capítulo/objetivo (regioes_reinos, ataques_raw, grimorio_final…) |
| 6/7 | `PostgreSQL/Script/cadastro_games/dml_magical_world.sql` | Conteúdo de gestão (1 desafio, 5 capítulos, objetivos, dicas, consultas) |
| 7/7 | `PostgreSQL/Script/gestão/dcl_security.sql` | Usuário `users_sql_challenge` (somente leitura, para queries dos jogadores) |

Os arquivos de `Games/` e `PostgreSQL/` vêm do repositório `sql-challenge-modelagem_de_dados` (passado via `--modelagem`).

### Banco de staging (`db_gestao_staging`)

O staging usa os fixtures em `tests/fixtures/` (schema + pg_dump do magical_world + dados de teste). A auto-inicialização via `docker-entrypoint-initdb.d` ocorre na primeira criação do volume; o script detecta isso e pula a inicialização manual quando o banco já está populado.

### Pré-requisitos

- Docker e Docker Compose instalados
- `.env.production` e/ou `.env.staging` preenchidos (gerados pelo `setup-server.sh`)
- Repositório `sql-challenge-modelagem_de_dados` clonado (obrigatório para produção)

---

## Banco de dados

O banco `db_gestao` contém os dados de gestão da plataforma:

| Tabela | Propósito |
|--------|-----------|
| `Desafio` | Desafios disponíveis (título, XP, tempo estimado) |
| `Capitulo` | Capítulos narrativos de cada desafio |
| `Objetivo` | Tarefas SQL a completar |
| `Dica` | Dicas com penalidade de XP |
| `Visao` | Container de schema de banco para o desafio |
| `Consulta` | Resposta esperada para cada objetivo |
| `Log` | Auditoria automática via triggers (JSONB) |

O schema `magical_world` (dentro do mesmo banco) contém os dados do jogo:

| Tabela | Propósito |
|--------|-----------|
| `Feudo`, `Pessoa`, `Cidade` | Entidades principais do mundo |
| `Artefato`, `Posse_Artefatos` | Sistema de itens |
| `AcademiaMagica`, `Torres_Magicas` | Facções |
| `Ataques`, `Aliados_Politicos` | Eventos e relações |

---

## Arquitetura de deploy

```
GitHub Actions
   ├── feat/** ──► CI apenas (lint + build + testes)
   ├── dev     ──► CI → CD staging  (porta 3010, DB db_gestao_staging)
   └── main    ──► CI → CD produção (porta 3000, DB db_gestao)

VPS (Nginx + Let's Encrypt)
   ├── /api/         → localhost:3000 (produção)
   └── /staging/api/ → localhost:3010 (staging)
```

---

## Setup do servidor

> O setup completo é feito pelo script do repositório frontend.
> Siga as instruções em [sql-challenge-frontend/scripts/setup-server.sh](https://github.com/sql-challenge/sql-challenge-frontend/blob/main/scripts/setup-server.sh).

### Resumo rápido

```bash
# 1. Clonar frontend (contém o script de setup)
git clone https://github.com/sql-challenge/sql-challenge-frontend.git \
  ~/sql-challenge-frontend

# 2. Primeira execução — cria ~/setup.env
bash ~/sql-challenge-frontend/scripts/setup-server.sh

# 3. Preencher credenciais
nano ~/setup.env

# 4. Execução completa
bash ~/sql-challenge-frontend/scripts/setup-server.sh
```

### GitHub Secrets necessários (neste repositório)

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` | IP da VPS |
| `VPS_PORT` | Porta SSH (`2222`) |
| `VPS_USER` | Usuário SSH (`admin`) |
| `VPS_SSH_KEY` | Chave privada Ed25519 (gerada pelo setup script) |
| `MAIL_USERNAME` | Email para notificações de CI/CD |
| `MAIL_PASSWORD` | Senha de app do Gmail |
| `POSTGRES_USER` | Usuário PostgreSQL |
| `POSTGRES_PASSWORD` | Senha PostgreSQL |
| `FB_API_KEY` | Firebase API Key |
| `FB_AUTH_DOMAIN` | Firebase Auth Domain |
| `FB_PROJECT_ID` | Firebase Project ID |
| `FB_STORAGE_BUCKET` | Firebase Storage Bucket |
| `FB_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `FB_APP_ID` | Firebase App ID |
| `FB_MEASUREMENT_ID` | Firebase Measurement ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin Project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Admin Client Email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin Private Key (chave completa com `\n`) |

### Comandos úteis na VPS

```bash
# Ver containers rodando
docker ps

# Logs do backend produção
docker compose -f ~/sql-challenge-backend/docker-compose.yml logs -f api

# Logs do backend staging
docker compose -f ~/sql-challenge-backend/docker-compose.staging.yml logs -f api

# Conectar ao banco de produção
docker compose -f ~/sql-challenge-backend/docker-compose.yml exec db \
  psql -U challenge_user -d db_gestao

# Conectar ao banco de staging
docker compose -f ~/sql-challenge-backend/docker-compose.staging.yml exec db-staging \
  psql -U challenge_user -d db_gestao_staging
```

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server com nodemon |
| `npm run dev:local` | Dev server com `.env.local` |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar servidor compilado |
| `npm test` | Todos os testes |
| `npm run test:unit` | Testes unitários |
| `npm run test:integration` | Testes de integração |
| `npm run test:e2e` | Testes end-to-end |
| `npm run test:security` | Testes de segurança |
| `npm run test:coverage` | Cobertura de código |
