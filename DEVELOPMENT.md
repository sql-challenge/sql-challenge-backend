# DEVELOPMENT.md — Ambiente de desenvolvimento

Guia completo para rodar o backend localmente. Complementa o [README](./README.md).

## Pré-requisitos

| Requisito | Observação |
|-----------|------------|
| Node.js ≥ 20 · npm ≥ 9 | — |
| Docker + Docker Compose | PostgreSQL de dev e emuladores Firebase (Docker Desktop ou colima no macOS; `docker-engine`/Podman no Linux; Docker Desktop + WSL2 no Windows) |
| Repositório modelagem | Clonado **ao lado** deste: `../sql-challenge-modelagem_de_dados` |
| Projeto Firebase | **Só para o servidor** — em dev os emuladores locais substituem o Firebase real |

## Matriz de ambientes

| Ambiente | Banco | Firebase | Onde roda | Quem gerencia |
|----------|-------|----------|-----------|---------------|
| **dev** | `db_gestao_dev` (5432) | **emuladores locais** (Auth 9099 · Firestore 8080) | máquina local | `scripts/db-dev.sh` + `npm run emulators` |
| **staging** | `db_gestao_staging` (5433) | projeto `sqlmystery` | servidor | GitHub Actions (`cd.yml`) |
| **produção** | `db_gestao` (5432) | projeto `sqlmystery` | servidor | GitHub Actions (`cd.yml`) |

> A máquina local roda **apenas dev** — tanto para o banco quanto para o Firebase. O guard em `firebaseAdminConfig.ts` **recusa** iniciar com `NODE_ENV=development` apontando para o projeto de produção sem emuladores. O contrato do banco (ordem do pipeline, DCL, convenções) está em [`modelagem/DATABASE.md`](../sql-challenge-modelagem_de_dados/DATABASE.md).

## Primeira vez

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente (template de dev)
cp .env.development.example .env

# 3. Banco de dev (sobe o container + semeia o pipeline do modelagem)
bash scripts/db-dev.sh up

# 4. Firebase local (Auth + Firestore) — em um terminal separado
npm run emulators

# 5. Servidor de desenvolvimento (nodemon)
npm run dev
```

Smoke test: `curl http://localhost:3002/api/health`

Se o repositório modelagem não estiver clonado:

```bash
git clone https://github.com/sql-challenge/sql-challenge-modelagem_de_dados.git \
  ../sql-challenge-modelagem_de_dados
```

## Dia a dia (banco de dev)

| Comando | O que faz |
|---------|-----------|
| `bash scripts/db-dev.sh up` | Sobe o container e semeia se o banco estiver vazio |
| `bash scripts/db-dev.sh reseed` | Recria o banco do zero (⚠️ apaga os dados de dev) |
| `bash scripts/db-dev.sh psql` | Abre sessão psql no `db_gestao_dev` |
| `bash scripts/db-dev.sh status` | Estado do container + contagens das tabelas |
| `bash scripts/db-dev.sh down` | Para o container (dados preservados) |
| `bash scripts/db-dev.sh purge-old` | Remove containers/volumes antigos de "produção local" |

Equivalentes: `bash scripts/db-init.sh --env dev` (delega para `db-dev.sh up`).

Atualizou o conteúdo do jogo no repositório modelagem? → `bash scripts/db-dev.sh reseed`.

## Firebase local (emuladores)

Em dev **nunca** use o projeto Firebase de produção. Os emuladores (Auth + Firestore) rodam localmente — escolha um dos dois métodos:

### Método recomendado: Docker (sem instalar nada além do Docker)

Imagem `andreysenov/firebase-tools` — já traz o Java do emulador dentro do container:

```bash
npm run emulators                            # Auth 9099 · Firestore 8080 · UI 4000
bash firebase/emulator/firebase-emulators.sh --clear   # reseta os dados locais antes de subir
```

**Pré-requisito**: Docker rodando (macOS: Docker Desktop ou `colima start` · Linux: `sudo systemctl start docker` ou Podman).

### Alternativa: sem Docker (firebase-tools + Java nativos)

Para quem prefere não usar container. Requer **Java 11+** (o emulador do Firestore roda em Java):

```bash
# Linux (Debian/Ubuntu)
sudo apt install openjdk-21-jre-headless

# Linux (Fedora)
sudo dnf install java-21-openjdk

# macOS (Homebrew)
brew install openjdk@21
export PATH="$(brew --prefix)/opt/openjdk@21/bin:$PATH"   # openjdk é keg-only

# rodar (usa firebase.json — os emuladores escutam só em localhost)
npm run emulators:native
bash firebase/emulator/firebase-emulators-native.sh --clear   # resetar os dados
```

> O método nativo usa `firebase.json` (host `localhost`); o Docker usa `firebase.docker.json` (host `0.0.0.0`, obrigatório para o port mapping). Portas e persistência são idênticas nos dois métodos, e os dois podem ser alternados livremente.

### Comum aos dois métodos

- **Projeto de dev**: `demo-sql-challenge` — namespace local dos emuladores (o prefixo `demo-` nunca toca a nuvem). Tokens emitidos pelo emulador carregam esse project-id, por isso backend e frontend usam o mesmo valor no `.env`/`.env.local` de dev. Produção/staging usam `sqlmystery`.
- **UI**: http://localhost:4000 — crie contas, inspecione o Firestore e leia os e-mails (recuperação de senha etc.) que o emulador "envia".
- **Persistência**: os dados ficam em `.emulator-data/` e sobrevivem a restarts (exportados ao encerrar com Ctrl+C).
- **Contas de teste**: crie pelo próprio app (tela de registro) ou pela UI do emulador.
- O `.env` de dev já traz `FIREBASE_AUTH_EMULATOR_HOST` e `FIRESTORE_EMULATOR_HOST` — o Admin SDK roteia sozinho para os emuladores.

### Guard: produção bloqueada em dev

Com `NODE_ENV=development`, o backend **recusa iniciar** quando `FIREBASE_PROJECT_ID` é o projeto de produção (`sqlmystery`) e os emuladores não estão configurados. Para usar o Firebase real conscientemente (ex.: demo com dados reais):

```bash
ALLOW_FIREBASE_PROD_IN_DEV=true
```

> ⚠️ Com essa flag, dados de dev passam a ser gravados na nuvem de produção.

## Testes

```bash
npm run test:unit          # unitários (sem banco)
npm run test:integration   # integração
npm run test:security
npm run test:e2e
```

O CI (`.github/workflows/ci.yml`) provisiona um PostgreSQL próprio (`db_gestao_test`) e usa **fixtures** (`tests/fixtures/`) — os testes não dependem do modelagem nem do banco de dev.

## Troubleshooting

| Sintoma | Causa provável / solução |
|---------|--------------------------|
| `❌ [Firebase] NODE_ENV=development apontando para a produção` | Suba os emuladores (`npm run emulators`) e confira `FIREBASE_AUTH_EMULATOR_HOST` / `FIRESTORE_EMULATOR_HOST` no `.env` |
| Login/auth falha no app local | Emuladores fora do ar → `npm run emulators` (ou `npm run emulators:native`) |
| `Cannot find module '.../emulators:start'` no Docker | Você invocou a imagem sem `--entrypoint` — use `npm run emulators` |
| Emulador Docker sem resposta nas portas | Config de host errada — Docker exige `firebase.docker.json` (já usado pelo script) |
| Quero o emulador sem Docker | Requer Java 11+ (`apt install openjdk-21-jre-headless` / `dnf install java-21-openjdk` / `brew install openjdk@21`) e `npm run emulators:native` |
| `port is already allocated` na 5432 | Container antigo de produção local rodando → `bash scripts/db-dev.sh purge-old` |
| `database "db_gestao_dev" does not exist` | Banco nunca semeado → `bash scripts/db-dev.sh up` |
| Erros de conexão após trocar de banco | Confira `DATABASE_URL` no `.env` (deve conter `db_gestao_dev`) |
| `Repositório modelagem não encontrado` | Clone ao lado do backend ou exporte `MODELAGEM_DIR=/caminho/do/repo` |
| Alterei o conteúdo do jogo e não aparece | `bash scripts/db-dev.sh reseed` |
| Quero começar com o Firebase limpo | `bash firebase/emulator/firebase-emulators.sh --clear` |

## Estrutura de scripts

```
scripts/                        → ferramentas de banco
  db-dev.sh                     → banco de DESENVOLVIMENTO (local)         ← use no dia a dia
  db-init.sh                    → bancos de servidor (production/staging)  ← use no servidor
  setup-env.sh                  → cria .env.production no servidor (segredos via env vars)

firebase/emulator/              → Firebase local (Auth + Firestore)
  firebase.json                 → config nativa (host localhost)
  firebase.docker.json          → config Docker (host 0.0.0.0)
  firebase-emulators.sh         → launcher Docker                          ← use no dia a dia
  firebase-emulators-native.sh  → launcher sem Docker (requer Java)
```
