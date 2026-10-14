#!/usr/bin/env bash
# =============================================================================
#  db-dev.sh — Banco de dados de DESENVOLVIMENTO
# =============================================================================
#
#  Sobe e semeia o banco de dev (db_gestao_dev, porta 5432) a partir do
#  pipeline numerado do repositório sql-challenge-modelagem_de_dados.
#
#  Este script NUNCA toca staging/produção — esses vivem no servidor.
#
#  Uso:
#    bash scripts/db-dev.sh up        # sobe + semeia (se o banco estiver vazio)
#    bash scripts/db-dev.sh reseed    # recria do zero (APAGA os dados de dev)
#    bash scripts/db-dev.sh psql      # abre sessão psql no banco de dev
#    bash scripts/db-dev.sh status    # estado do container + contagens
#    bash scripts/db-dev.sh down      # para o container (dados preservados)
#    bash scripts/db-dev.sh purge-old # remove container/volume antigos de "produção local"
#
#  Variáveis opcionais:
#    MODELAGEM_DIR   caminho do repositório modelagem
#                    (padrão: ../sql-challenge-modelagem_de_dados)
#    POSTGRES_DB     nome do banco de dev     (padrão: db_gestao_dev)
#    POSTGRES_USER   usuário admin do banco   (padrão: challenge_user)
#    APP_USER        usuário de aplicação     (padrão: users_sql_challenge)
#    APP_PASSWORD    senha do usuário de app  (padrão: app_pass_dev — só dev)
#
#  Pré-requisitos:
#    • Docker + Docker Compose
#    • Repositório sql-challenge-modelagem_de_dados clonado ao lado
# =============================================================================

set -euo pipefail

# ─── Cores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()  { echo -e "\n${CYAN}${BOLD}┌─ $* ─────────────────────────────────────────${RESET}"; }
ok()    { echo -e "  ${GREEN}✅ $*${RESET}"; }
warn()  { echo -e "  ${YELLOW}⚠️  $*${RESET}"; }
err()   { echo -e "  ${RED}❌ $*${RESET}"; exit 1; }
step()  { echo -e "  ${BOLD}▶ $*${RESET}"; }
sql_ok(){ echo -e "  ${GREEN}  SQL ✓${RESET} $*"; }

# ─── Caminhos e parâmetros ───────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MODELAGEM_DIR="${MODELAGEM_DIR:-$(cd "$BACKEND_DIR/../sql-challenge-modelagem_de_dados" 2>/dev/null && pwd || echo "")}"
COMPOSE_FILE="$BACKEND_DIR/docker-compose.dev.yml"
SERVICE="db"

DB="${POSTGRES_DB:-db_gestao_dev}"
DB_USER="${POSTGRES_USER:-challenge_user}"
APP_USER="${APP_USER:-users_sql_challenge}"
APP_PASSWORD="${APP_PASSWORD:-app_pass_dev}"   # senha de dev — não é segredo

# ─── Helpers ─────────────────────────────────────────────────────────────────
dc()       { docker compose -f "$COMPOSE_FILE" "$@"; }
db_exec()  { dc exec -T "$SERVICE" psql -U "$DB_USER" -d "$DB" -v ON_ERROR_STOP=1 "$@"; }

wait_healthy() {
  local max=40 count=0
  step "Aguardando PostgreSQL de dev ficar pronto..."
  until dc exec -T "$SERVICE" pg_isready -U "$DB_USER" -d "$DB" &>/dev/null; do
    count=$((count + 1))
    [ "$count" -ge "$max" ] && err "PostgreSQL não ficou pronto após $((max * 5))s"
    sleep 5
    printf "."
  done
  echo ""
  ok "PostgreSQL pronto"
}

check_modelagem() {
  [ -n "$MODELAGEM_DIR" ] && [ -d "$MODELAGEM_DIR" ] || \
    err "Repositório modelagem não encontrado em '$MODELAGEM_DIR'
   Clone com: git clone https://github.com/sql-challenge/sql-challenge-modelagem_de_dados.git ../sql-challenge-modelagem_de_dados
   Ou defina MODELAGEM_DIR=/caminho/para/o/repo"

  local required=(
    "sql/01_gestao_ddl.sql"
    "sql/02_magical_world_ddl.sql"
    "sql/03_magical_world_dml.sql"
    "sql/04_game_views.sql"
    "sql/05_challenge_content.sql"
    "sql/06_security_dcl.sql"
  )
  for f in "${required[@]}"; do
    [ -f "$MODELAGEM_DIR/$f" ] || err "Arquivo do pipeline não encontrado: $MODELAGEM_DIR/$f"
  done
  ok "Repositório modelagem: $MODELAGEM_DIR"
}

run_sql_file() {  # label, arquivo, [-v ...] extras
  local label="$1"; shift
  local sql_file="$1"; shift
  [ -f "$sql_file" ] || err "Arquivo SQL não encontrado: $sql_file"
  step "Aplicando: $label"
  dc exec -T "$SERVICE" psql -U "$DB_USER" -d "$DB" -v ON_ERROR_STOP=1 "$@" < "$sql_file" > /dev/null
  sql_ok "$label"
}

verify_db() {
  info "Verificando banco de dev: $DB"
  db_exec -P pager=off <<'SQL'
SELECT 'Desafio'  AS tabela, COUNT(*) AS linhas FROM Desafio
UNION ALL SELECT 'Capitulo',  COUNT(*) FROM Capitulo
UNION ALL SELECT 'Objetivo',  COUNT(*) FROM Objetivo
UNION ALL SELECT 'Dica',      COUNT(*) FROM Dica
UNION ALL SELECT 'Visao',     COUNT(*) FROM Visao
UNION ALL SELECT 'Consulta',  COUNT(*) FROM Consulta
UNION ALL SELECT 'magical_world.Feudo',    COUNT(*) FROM magical_world.Feudo
UNION ALL SELECT 'magical_world.Pessoa',   COUNT(*) FROM magical_world.Pessoa
UNION ALL SELECT 'magical_world.Artefato', COUNT(*) FROM magical_world.Artefato;
SQL
}

seed() {
  check_modelagem

  # Pipeline numerado: 01 → 05
  for f in "$MODELAGEM_DIR"/sql/0[1-5]_*.sql; do
    run_sql_file "$(basename "$f")" "$f"
  done

  # DCL parametrizado (usuário de aplicação)
  run_sql_file "06_security_dcl.sql ($APP_USER)" \
    "$MODELAGEM_DIR/sql/06_security_dcl.sql" \
    -v "app_user=$APP_USER" -v "app_password=$APP_PASSWORD" -v "app_db=$DB"

  verify_db
}

# ─── Comandos ────────────────────────────────────────────────────────────────
cmd_up() {
  info "Banco de DEV — $DB (porta 5432, container sql-challenge-db-dev)"
  step "Subindo container de dev"
  dc up -d "$SERVICE"
  wait_healthy

  local table_count
  table_count=$(dc exec -T "$SERVICE" psql -U "$DB_USER" -d "$DB" -t -A \
    -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null || echo "0")

  if [ "$table_count" -gt 0 ]; then
    ok "Banco já inicializado ($table_count tabelas) — use 'reseed' para recriar do zero"
  else
    step "Banco vazio — aplicando pipeline do modelagem"
    seed
  fi

  echo ""
  echo -e "  ${BOLD}DATABASE_URL${RESET}: postgresql://$DB_USER:***@localhost:5432/$DB?sslmode=disable"
  ok "Ambiente de dev pronto"
}

cmd_reseed() {
  info "RECRIANDO o banco de dev — $DB"
  warn "Os dados locais de dev serão apagados (staging/produção não são afetados)"
  step "Removendo container e volume de dev"
  dc down -v 2>/dev/null || true
  ok "Volume de dev removido"
  cmd_up
}

cmd_psql() {
  step "Sessão psql: $DB"
  dc exec "$SERVICE" psql -U "$DB_USER" -d "$DB"
}

cmd_status() {
  info "Status do banco de dev"
  dc ps

  if db_exec -t -A -c "SELECT 1" &>/dev/null; then
    echo -e "  PostgreSQL: $(db_exec -t -A -c 'SHOW server_version;')"
    verify_db
  else
    warn "Container não está pronto — rode: bash scripts/db-dev.sh up"
  fi
}

cmd_down() {
  step "Parando container de dev (dados preservados)"
  dc down
  ok "Container parado — 'up' para voltar"
}

cmd_purge_old() {
  info "Removendo ambientes ANTIGOS de 'produção local'"
  warn "Containers/volumes que serão removidos:"
  echo "    • sql-challenge-db          (banco 'produção' local — db_gestao)"
  echo "    • sql-challenge-db-staging  (staging local, se existir)"
  echo "    • sql-challenge-api-production / sql-challenge-api-staging"
  echo "    • volumes sql-challenge-backend_pgdata e _postgres_staging_data"

  local confirm="${1:-}"
  if [ "$confirm" != "--yes" ]; then
    read -r -p "  Digite 'APAGAR' para confirmar: " confirm
    [ "$confirm" = "APAGAR" ] || { echo "  Operação cancelada — nada foi alterado."; return 0; }
  fi

  local c v
  for c in sql-challenge-db sql-challenge-db-staging sql-challenge-api-production sql-challenge-api-staging; do
    if docker rm -f "$c" &>/dev/null; then ok "container removido: $c"; else warn "container não existe (ok): $c"; fi
  done
  for v in sql-challenge-backend_pgdata sql-challenge-backend_postgres_staging_data; do
    if docker volume rm "$v" &>/dev/null; then ok "volume removido: $v"; else warn "volume não existe (ok): $v"; fi
  done
  ok "Limpeza concluída — a máquina local agora tem só o banco de dev"
}

# ─── Main ────────────────────────────────────────────────────────────────────
COMMAND="${1:-up}"

case "$COMMAND" in
  up)        cmd_up ;;
  reseed)    cmd_reseed ;;
  psql)      cmd_psql ;;
  status)    cmd_status ;;
  down)      cmd_down ;;
  purge-old) cmd_purge_old "${2:-}" ;;
  -h|--help|help)
    sed -n '3,30p' "$0" | grep -E '^\s+#' | sed 's/^\s*#\s\?//'
    ;;
  *) err "Comando desconhecido: $COMMAND  (use --help para ajuda)" ;;
esac
