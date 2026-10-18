# DEPLOYMENT.md — Backend (Docker · K8s · VPS · banco)

Runbook de deploy do backend. Para desenvolvimento local, veja
[DEVELOPMENT.md](./DEVELOPMENT.md). Para a visão geral do monorepo
(staging x produção, CI), veja o [README do monorepo](https://github.com/sql-challenge/sql-challenge-monorepo#readme).

## Docker Compose

```bash
# API + banco de dados
docker compose up -d --build

# Apenas banco
docker compose up -d db

# Logs / parar / limpar
docker compose logs -f api
docker compose down
docker compose down -v        # ⚠️ apaga os dados do banco
```

## Kubernetes (K3s)

Manifestos no monorepo (`k8s/`): namespace, secrets, PostgreSQL 16
StatefulSet (5Gi PVC), Deployment + Service do backend (porta 3000,
probes em `/api/health`), Ingress Traefik + cert-manager.

```bash
# 1. Build da imagem
docker build -t sql-challenge-backend:latest --target runner .
docker save sql-challenge-backend:latest > backend.tar
scp backend.tar ubuntu@<node>:~/
ssh ubuntu@<node> 'sudo k3s ctr images import backend.tar'

# 2. Editar secrets reais (FIREBASE_PRIVATE_KEY, ADMIN_EMAILS, EMAIL_PASS...)
#    k8s/01-secrets.yaml → aplicar

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

Detalhes de runtime já garantidos pelos manifestos: init container
`wait-for-postgres` + retry `waitForDatabase()` na aplicação (3 tentativas,
crash se falhar), health check `GET /api/health`.

> ⚠️ **Antes de expor o /admin**: preencha `ADMIN_EMAILS` em
> `k8s/01-secrets.yaml` e `TRUST_PROXY=true` (o backend fica atrás do
> ingress — sem trust proxy o rate limit vê todos os alunos pelo IP do
> proxy). A `FIREBASE_PRIVATE_KEY` real também é obrigatória para ranking,
> dashboard e revogação de tokens funcionarem.

## VPS (produção/staging via GitHub Actions)

O setup completo da VPS é feito pelo script do frontend:
[`sql-challenge-frontend/scripts/setup-server.sh`](https://github.com/sql-challenge/sql-challenge-frontend/blob/main/scripts/setup-server.sh).

### GitHub Secrets (neste repositório)

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` / `VPS_PORT` / `VPS_USER` / `VPS_SSH_KEY` | Acesso SSH |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | PostgreSQL |
| `FB_API_KEY` / `FB_AUTH_DOMAIN` / `FB_PROJECT_ID` | Firebase cliente |
| `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Firebase Admin (chave com `\n` literais) |

### Comandos úteis na VPS

```bash
docker ps
docker compose -f ~/sql-challenge-backend/docker-compose.yml logs -f api
docker compose -f ~/sql-challenge-backend/docker-compose.yml exec db \
  psql -U challenge_user -d db_gestao
```

## db-init.sh — banco de staging/produção

Gerencia criação + semeadura dos bancos de servidor (nunca toca o dev).

```bash
bash scripts/db-init.sh                    # produção + staging
bash scripts/db-init.sh --env production --modelagem ../sql-challenge-modelagem_de_dados
bash scripts/db-init.sh --env staging
bash scripts/db-init.sh --env production --reset   # ⚠️ APAGA TODOS OS DADOS
```

### Ordem de execução — produção (fonte: modelagem `sql/`)

| Passo | Arquivo | O que faz |
|-------|---------|-----------|
| 1/6 | `sql/01_gestao_ddl.sql` | Tabelas de gestão + triggers de auditoria |
| 2/6 | `sql/02_magical_world_ddl.sql` | Schema `magical_world` + tabelas do jogo |
| 3/6 | `sql/03_magical_world_dml.sql` | Dados do mundo mágico (feudos, pessoas, artefatos...) |
| 4/6 | `sql/04_game_views.sql` | Views jogáveis (uma por objetivo) |
| 5/6 | `sql/05_challenge_content.sql` | Conteúdo do jogo (desafios, capítulos, objetivos, dicas) |
| 6/6 | `sql/06_security_dcl.sql` | Usuário de aplicação somente-leitura |

### Ordem de execução — staging

Usa fixtures locais quando presentes (mais rápido p/ CI), com fallback para
o modelagem: `tests/fixtures/schema.sql` → `tests/fixtures/magical_world.sql`
(pg_dump) → conteúdo via `sql/05` (ou `tests/fixtures/data.sql`) → DCL.

> O contrato completo do pipeline (dependências, tipos, avisos) está em
> [`sql-challenge-modelagem_de_dados/DATABASE.md`](https://github.com/sql-challenge/sql-challenge-modelagem_de_dados/blob/merge/facundes-main/DATABASE.md).
