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

# 2. Criar .env a partir do template de dev
cp .env.development.example .env

# 3. Banco de dev (sobe o PostgreSQL + semeia o pipeline do modelagem)
bash scripts/db-dev.sh up

# 4. Iniciar servidor
npm run dev
```

> ⚠️ Atenção: O servidor roda na porta `3002` (não `3000`). A porta `3000` é usada pelo frontend.
> 📖 Guia completo de desenvolvimento (pré-requisitos, banco, testes, troubleshooting): [DEVELOPMENT.md](./DEVELOPMENT.md).

---

## Pré-requisitos

- **Node.js** ≥ 20
- **npm** ≥ 9
- **Docker** + **Docker Compose** (para PostgreSQL)
- **Firebase project** (console.firebase.google.com)
- **Repositório modelagem** clonado ao lado (fonte do pipeline do banco):
  ```bash
  git clone https://github.com/sql-challenge/sql-challenge-modelagem_de_dados.git \
    ../sql-challenge-modelagem_de_dados
  ```

---

## Setup Local Passo a Passo

Detalhes e troubleshooting: [DEVELOPMENT.md](./DEVELOPMENT.md).

### 1. Variáveis de ambiente

```bash
cp .env.development.example .env
```

Edite `.env` com seus valores. Veja [Variáveis de ambiente](#variáveis-de-ambiente) para detalhes.

### 2. Banco de dados (dev)

```bash
# Sobe o container PostgreSQL de dev (db_gestao_dev) e semeia o pipeline
bash scripts/db-dev.sh up

# Recriar do zero (apaga os dados de dev)
bash scripts/db-dev.sh reseed
```

O pipeline numerado do repositório modelagem (`sql/01` → `sql/06`) cria o schema de gestão (`public`) e o mundo mágico (`magical_world`). O contrato está em [`modelagem/DATABASE.md`](../sql-challenge-modelagem_de_dados/DATABASE.md).

> Ambientes de servidor (staging/produção) usam `scripts/db-init.sh --env production|staging` — veja DATABASE.md.

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
DATABASE_URL=postgresql://challenge_user:challenge_pass@localhost:5432/db_gestao_dev?sslmode=disable

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

## Kubernetes (K3s)

O backend pode ser implantado em cluster K3s. Manifestos disponíveis em `k8s/` (monorepo):

```bash
# 1. Build da imagem
docker build -t sql-challenge-backend:latest --target runner .
docker save sql-challenge-backend:latest > backend.tar
scp backend.tar ubuntu@<node>:~/
ssh ubuntu@<node> 'sudo k3s ctr images import backend.tar'

# 2. Editar secrets com credenciais reais (FIREBASE_PRIVATE_KEY, EMAIL_PASS)
#    k8s/01-secrets.yaml → aplicar com kubectl apply -f k8s/

# 3. Aplicar manifestos
kubectl apply -f k8s/

# 4. Inicializar banco (do k3s-cp) — pipeline numerado do modelagem
kubectl cp ../sql-challenge-modelagem_de_dados/sql/01_gestao_ddl.sql sql-challenge/postgres-0:/tmp/
kubectl cp ../sql-challenge-modelagem_de_dados/sql/02_magical_world_ddl.sql sql-challenge/postgres-0:/tmp/
kubectl cp ../sql-challenge-modelagem_de_dados/sql/03_magical_world_dml.sql sql-challenge/postgres-0:/tmp/
kubectl cp ../sql-challenge-modelagem_de_dados/sql/04_game_views.sql sql-challenge/postgres-0:/tmp/
kubectl cp ../sql-challenge-modelagem_de_dados/sql/05_challenge_content.sql sql-challenge/postgres-0:/tmp/
kubectl exec -n sql-challenge postgres-0 -- sh -c " \
  psql -U challenge_user -d db_gestao -f /tmp/01_gestao_ddl.sql && \
  psql -U challenge_user -d db_gestao -f /tmp/02_magical_world_ddl.sql && \
  psql -U challenge_user -d db_gestao -f /tmp/03_magical_world_dml.sql && \
  psql -U challenge_user -d db_gestao -f /tmp/04_game_views.sql && \
  psql -U challenge_user -d db_gestao -f /tmp/05_challenge_content.sql"
```

**Recursos**:
- PostgreSQL 16 StatefulSet (5Gi PVC, `pg_isready` probes)
- Backend Deployment + Service (porta 3000, HTTP probes em `/api/health`)
- Init container `wait-for-postgres` — aguarda `pg_isready` antes do app iniciar
- `waitForDatabase()` na aplicação — retry loop com 3 tentativas e crash se falhar
- Traefik Ingress + cert-manager TLS (`sql-challenge-back.atcfalcons.org`)
- NodeSelector `k3s-worker` para cargas de trabalho

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
