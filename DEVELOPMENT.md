# DEVELOPMENT.md — Ambiente de desenvolvimento

Guia completo para rodar o backend localmente. Complementa o [README](./README.md).

## Pré-requisitos

| Requisito | Observação |
|-----------|------------|
| Node.js ≥ 20 · npm ≥ 9 | — |
| Docker + Docker Compose | PostgreSQL de dev (no macOS, Docker Desktop ou colima) |
| Repositório modelagem | Clonado **ao lado** deste: `../sql-challenge-modelagem_de_dados` |
| Projeto Firebase | Credenciais Client + Admin (Auth/Firestore) |

## Matriz de ambientes

| Ambiente | Banco | Porta | Onde roda | Quem gerencia |
|----------|-------|-------|-----------|---------------|
| **dev** | `db_gestao_dev` | 5432 | máquina local | `scripts/db-dev.sh` |
| **staging** | `db_gestao_staging` | 5433 | servidor | GitHub Actions (`cd.yml`) |
| **produção** | `db_gestao` | 5432 | servidor | GitHub Actions (`cd.yml`) |

> A máquina local roda **apenas o banco de dev**. O pipeline nunca aponta para staging/produção a partir do dev.
> O contrato do banco (ordem do pipeline, DCL, convenções) está em [`modelagem/DATABASE.md`](../sql-challenge-modelagem_de_dados/DATABASE.md).

## Primeira vez

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente (template de dev)
cp .env.development.example .env
# edite .env e preencha as credenciais do Firebase

# 3. Banco de dev (sobe o container + semeia o pipeline do modelagem)
bash scripts/db-dev.sh up

# 4. Servidor de desenvolvimento (nodemon)
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
| `port is already allocated` na 5432 | Container antigo de produção local rodando → `bash scripts/db-dev.sh purge-old` |
| `database "db_gestao_dev" does not exist` | Banco nunca semeado → `bash scripts/db-dev.sh up` |
| Erros de conexão após trocar de banco | Confira `DATABASE_URL` no `.env` (deve conter `db_gestao_dev`) |
| `Repositório modelagem não encontrado` | Clone ao lado do backend ou exporte `MODELAGEM_DIR=/caminho/do/repo` |
| Health check falha com Firebase | Preencha as credenciais Client/Admin no `.env` |
| Alterei o conteúdo do jogo e não aparece | `bash scripts/db-dev.sh reseed` |

## Estrutura de scripts

```
scripts/
  db-dev.sh    → banco de DESENVOLVIMENTO (local)          ← use no dia a dia
  db-init.sh   → bancos de servidor (production/staging)   ← use no servidor
  setup-env.sh → cria .env.production no servidor (segredos via env vars)
```
