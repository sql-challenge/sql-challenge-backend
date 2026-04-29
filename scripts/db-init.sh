#!/usr/bin/env bash
# =============================================================================
#  db-init.sh — Inicialização completa dos bancos de dados
# =============================================================================
#
#  Gerencia os dois bancos do SQL Challenge:
#    • db_gestao          → produção  (porta 5432, container sql-challenge-db)
#    • db_gestao_staging  → staging   (porta 5433, container sql-challenge-db-staging)
#
#  Uso:
#    bash scripts/db-init.sh [OPÇÕES]
#
#  Opções:
#    --env production   Inicializa apenas o banco de produção
#    --env staging      Inicializa apenas o banco de staging/teste
#    --env all          Inicializa ambos (padrão)
#    --reset            Destrói o volume e recria do zero  ⚠️  DESTRUTIVO
#    --modelagem DIR    Caminho para o repo sql-challenge-modelagem_de_dados
#                       (padrão: ../sql-challenge-modelagem_de_dados)
#
#  Exemplos:
#    bash scripts/db-init.sh                          # inicializa ambos
#    bash scripts/db-init.sh --env production         # só produção
#    bash scripts/db-init.sh --env staging --reset    # reset do staging
#    bash scripts/db-init.sh --modelagem /home/admin/sql-challenge-modelagem_de_dados
#
#  Pré-requisitos:
#    • Docker e Docker Compose instalados
#    • Arquivo .env.production e/ou .env.staging preenchidos
#    • Repositório sql-challenge-modelagem_de_dados clonado (para produção)
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

# ─── Defaults ────────────────────────────────────────────────────────────────
MODE="all"
RESET=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MODELAGEM_DIR="$(cd "$BACKEND_DIR/../sql-challenge-modelagem_de_dados" 2>/dev/null || echo "")"

# ─── Parse de argumentos ─────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)       MODE="$2";       shift 2 ;;
    --reset)     RESET=true;      shift   ;;
    --modelagem) MODELAGEM_DIR="$2"; shift 2 ;;
    -h|--help)
      sed -n '3,50p' "$0" | grep -E '^\s+#' | sed 's/^\s*#//'
      exit 0 ;;
    *) err "Opção desconhecida: $1  (use --help para ajuda)" ;;
  esac
done

[[ "$MODE" =~ ^(production|staging|all)$ ]] || \
  err "Valor inválido para --env: $MODE (use production, staging ou all)"

# ─── Validações iniciais ─────────────────────────────────────────────────────
cd "$BACKEND_DIR"

check_env_file() {
  local env="$1"
  local file="$BACKEND_DIR/.env.$env"
  [ -f "$file" ] || err ".env.$env não encontrado em $BACKEND_DIR — execute setup-server.sh primeiro"
  grep -q "CHANGE_ME" "$file" && err ".env.$env ainda tem valores CHANGE_ME — preencha antes de continuar"
  echo "$file"
}

check_modelagem() {
  [ -n "$MODELAGEM_DIR" ] && [ -d "$MODELAGEM_DIR" ] || \
    err "Repositório modelagem não encontrado em '$MODELAGEM_DIR'
   Clone com: git clone https://github.com/sql-challenge/sql-challenge-modelagem_de_dados.git
   Ou passe: --modelagem /caminho/para/o/repo"

  local required=(
    "Games/magical world/ddl_game.sql"
    "Games/magical world/dml_gama.sql"
    "Games/magical world/dml_gama_patch.sql"
    "Games/magical world/vw_ddl_game.sql"
    "PostgreSQL/Script/cadastro_games/dml_magical_world.sql"
    "PostgreSQL/Script/gestão/dcl_security.sql"
  )
  for f in "${required[@]}"; do
    [ -f "$MODELAGEM_DIR/$f" ] || err "Arquivo não encontrado: $MODELAGEM_DIR/$f"
  done
  ok "Repositório modelagem: $MODELAGEM_DIR"
}

check_fixtures() {
  local required=("tests/fixtures/schema.sql" "tests/fixtures/data.sql")
  for f in "${required[@]}"; do
    [ -f "$BACKEND_DIR/$f" ] || err "Fixture não encontrada: $BACKEND_DIR/$f"
  done
  [ -f "$BACKEND_DIR/tests/fixtures/magical_world.sql" ] || \
    warn "magical_world.sql (fixture de staging) não encontrado — staging usará os arquivos do modelagem"
}

# =============================================================================
#  Funções de banco
# =============================================================================

# Aguarda o PostgreSQL ficar saudável
wait_healthy() {
  local compose_file="$1" service="$2" user="$3" db="$4" env_file="$5"
  local max=40 count=0
  step "Aguardando PostgreSQL ($service) ficar pronto..."
  until docker compose -f "$compose_file" --env-file "$env_file" \
      exec -T "$service" pg_isready -U "$user" -d "$db" &>/dev/null; do
    count=$((count + 1))
    [ "$count" -ge "$max" ] && err "PostgreSQL não ficou pronto após $((max * 5))s"
    sleep 5
    printf "."
  done
  echo ""
  ok "PostgreSQL pronto"
}

# Executa um arquivo SQL dentro do container
run_sql() {
  local compose_file="$1" service="$2" user="$3" db="$4" env_file="$5" sql_file="$6" label="$7"
  [ -f "$sql_file" ] || err "Arquivo SQL não encontrado: $sql_file"
  step "Aplicando: $label"
  docker compose -f "$compose_file" --env-file "$env_file" \
    exec -T "$service" \
    psql -U "$user" -d "$db" -v ON_ERROR_STOP=1 \
    < "$sql_file"
  sql_ok "$label"
}

# Executa SQL inline dentro do container
run_sql_inline() {
  local compose_file="$1" service="$2" user="$3" db="$4" env_file="$5"
  local sql="$6" label="$7"
  step "Aplicando: $label"
  echo "$sql" | docker compose -f "$compose_file" --env-file "$env_file" \
    exec -T "$service" \
    psql -U "$user" -d "$db" -v ON_ERROR_STOP=1
  sql_ok "$label"
}

# Verifica contagem de linhas em tabelas-chave
verify_db() {
  local compose_file="$1" service="$2" user="$3" db="$4" env_file="$5"
  info "Verificando banco: $db"
  echo "SELECT
    'Desafio'  AS tabela, COUNT(*) AS linhas FROM Desafio
  UNION ALL SELECT 'Capitulo',  COUNT(*) FROM Capitulo
  UNION ALL SELECT 'Objetivo',  COUNT(*) FROM Objetivo
  UNION ALL SELECT 'Dica',      COUNT(*) FROM Dica
  UNION ALL SELECT 'Visao',     COUNT(*) FROM Visao
  UNION ALL SELECT 'Consulta',  COUNT(*) FROM Consulta
  UNION ALL SELECT 'magical_world.Feudo', COUNT(*) FROM magical_world.Feudo
  UNION ALL SELECT 'magical_world.Pessoa', COUNT(*) FROM magical_world.Pessoa
  UNION ALL SELECT 'magical_world.Artefato', COUNT(*) FROM magical_world.Artefato;" \
  | docker compose -f "$compose_file" --env-file "$env_file" \
      exec -T "$service" psql -U "$user" -d "$db" -P pager=off
}

# =============================================================================
#  Reset de volume (--reset)
# =============================================================================
do_reset() {
  local compose_file="$1" env_file="$2" label="$3"
  echo -e "\n${RED}${BOLD}⚠️  ATENÇÃO — OPERAÇÃO DESTRUTIVA ⚠️${RESET}"
  echo -e "${RED}Isso vai APAGAR TODOS OS DADOS do banco de $label.${RESET}"
  read -r -p "Digite 'APAGAR' para confirmar: " confirm
  [ "$confirm" = "APAGAR" ] || { echo "Operação cancelada."; return 1; }

  step "Parando containers e removendo volumes de $label"
  docker compose -f "$compose_file" --env-file "$env_file" down -v 2>/dev/null || true
  ok "Volumes de $label removidos"
}

# =============================================================================
#  Inicialização do banco de PRODUÇÃO
# =============================================================================
init_production() {
  info "BANCO DE PRODUÇÃO — db_gestao"
  local env_file
  env_file=$(check_env_file "production")
  check_modelagem

  # shellcheck source=/dev/null
  source "$env_file"

  local compose_file="$BACKEND_DIR/docker-compose.yml"
  local service="db"
  local db="db_gestao"

  # ── Reset (se solicitado) ─────────────────────────────────────────────────
  if [ "$RESET" = true ]; then
    do_reset "$compose_file" "$env_file" "produção"
  fi

  # ── Sobe o container ──────────────────────────────────────────────────────
  step "Iniciando container PostgreSQL de produção"
  docker compose -f "$compose_file" --env-file "$env_file" up -d "$service"
  wait_healthy "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file"

  # ── Configura timezone e encoding ────────────────────────────────────────
  run_sql_inline "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "ALTER DATABASE $db SET timezone TO 'America/Sao_Paulo';
     ALTER DATABASE $db SET client_encoding TO 'UTF8';" \
    "Configuração de timezone e encoding"

  # ────────────────────────────────────────────────────────────────────────
  #  ORDEM CORRETA DE SCRIPTS
  # ────────────────────────────────────────────────────────────────────────

  # 1. Schema de gestão: tabelas, triggers e schema magical_world (vazio)
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$BACKEND_DIR/tests/fixtures/schema.sql" \
    "[1/7] Schema de gestão (Desafio, Capitulo, Objetivo, Dica, Visao, Consulta, Log + triggers)"

  # 2. DDL do mundo mágico: cria todas as tabelas do jogo
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$MODELAGEM_DIR/Games/magical world/ddl_game.sql" \
    "[2/7] DDL do mundo mágico (Feudo, Pessoa, Artefato, Cidade, Torres, etc.)"

  # 3. DML do mundo mágico: insere dados das entidades do jogo
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$MODELAGEM_DIR/Games/magical world/dml_gama.sql" \
    "[3/7] Dados do mundo mágico (8 feudos, 7 pessoas, artefatos, cidades...)"

  # 4. Patch: corrige bugs nos dados
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$MODELAGEM_DIR/Games/magical world/dml_gama_patch.sql" \
    "[4/7] Patch de dados"

  # 5. Views do jogo: uma view por objetivo de cada capítulo (5 capítulos)
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$MODELAGEM_DIR/Games/magical world/vw_ddl_game.sql" \
    "[5/7] Views do jogo (regioes_reinos, ataques_raw, posse_artefatos_base, grimorio_final...)"

  # 6. Conteúdo de gestão: Desafios, Capítulos, Objetivos, Dicas, Visões, Consultas
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$MODELAGEM_DIR/PostgreSQL/Script/cadastro_games/dml_magical_world.sql" \
    "[6/7] Conteúdo do jogo (1 desafio, 5 capítulos, objetivos, dicas, consultas)"

  # 7. Segurança: usuário de aplicação com acesso restrito (para queries dos jogadores)
  #    Adapta o dcl_security.sql substituindo a senha hardcoded pela variável de ambiente
  step "[7/7] Configurando usuário de aplicação (users_sql_challenge)"
  cat "$MODELAGEM_DIR/PostgreSQL/Script/gestão/dcl_security.sql" \
    | sed "s/WITH PASSWORD 'senha123'/WITH PASSWORD '${POSTGRES_PASSWORD}'/" \
    | docker compose -f "$compose_file" --env-file "$env_file" \
        exec -T "$service" psql -U "$POSTGRES_USER" -d "$db" -v ON_ERROR_STOP=1
  sql_ok "[7/7] Usuário users_sql_challenge criado"

  # Grants adicionais para o schema magical_world
  run_sql_inline "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "GRANT USAGE ON SCHEMA magical_world TO users_sql_challenge;
     GRANT SELECT ON ALL TABLES IN SCHEMA magical_world TO users_sql_challenge;
     ALTER DEFAULT PRIVILEGES IN SCHEMA magical_world
       GRANT SELECT ON TABLES TO users_sql_challenge;
     GRANT SELECT ON ALL TABLES IN SCHEMA public TO users_sql_challenge;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public
       GRANT SELECT ON TABLES TO users_sql_challenge;" \
    "Grants de SELECT em public e magical_world para users_sql_challenge"

  # Verificação final
  verify_db "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file"
  ok "Banco de PRODUÇÃO inicializado com sucesso"
}

# =============================================================================
#  Inicialização do banco de STAGING/TESTE
# =============================================================================
init_staging() {
  info "BANCO DE STAGING/TESTE — db_gestao_staging"
  local env_file
  env_file=$(check_env_file "staging")

  # shellcheck source=/dev/null
  source "$env_file"

  local compose_file="$BACKEND_DIR/docker-compose.staging.yml"
  local service="db-staging"
  local db="db_gestao_staging"

  # ── Reset (se solicitado) ─────────────────────────────────────────────────
  if [ "$RESET" = true ]; then
    do_reset "$compose_file" "$env_file" "staging"
  fi

  # ── Sobe o container ──────────────────────────────────────────────────────
  step "Iniciando container PostgreSQL de staging"

  # O docker-compose.staging.yml já inicializa o banco automaticamente
  # via docker-entrypoint-initdb.d na PRIMEIRA vez que o volume é criado.
  # Scripts: schema.sql → magical_world.sql (pg_dump) → data.sql
  docker compose -f "$compose_file" --env-file "$env_file" up -d "$service"
  wait_healthy "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file"

  # Detecta se o banco precisa de inicialização manual
  # (caso o volume já existia mas está vazio, ou foi feito reset manual)
  local table_count
  table_count=$(echo "SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" \
    | docker compose -f "$compose_file" --env-file "$env_file" \
        exec -T "$service" psql -U "$POSTGRES_USER" -d "$db" -t -A 2>/dev/null || echo "0")

  if [ "$table_count" -gt "0" ] && [ "$RESET" = false ]; then
    ok "Banco de staging já inicializado ($table_count tabelas encontradas)"
    ok "Use --reset para recriar do zero"
    verify_db "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file"
    return 0
  fi

  # Inicialização manual (quando auto-init não ocorreu ou após reset)
  step "Inicialização manual do banco de staging"

  # Configura timezone
  run_sql_inline "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "ALTER DATABASE $db SET timezone TO 'America/Sao_Paulo';
     ALTER DATABASE $db SET client_encoding TO 'UTF8';" \
    "Configuração de timezone e encoding"

  # 1. Schema de gestão
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$BACKEND_DIR/tests/fixtures/schema.sql" \
    "[1/4] Schema de gestão"

  # 2. Mundo mágico: usa o pg_dump fixture se existir, senão usa os arquivos do modelagem
  if [ -f "$BACKEND_DIR/tests/fixtures/magical_world.sql" ]; then
    step "[2/4] Dados do mundo mágico (via fixture pg_dump)"
    # Remove a linha \restrict do dump antes de executar (não é comando psql padrão)
    grep -v '^\\\restrict' "$BACKEND_DIR/tests/fixtures/magical_world.sql" \
      | docker compose -f "$compose_file" --env-file "$env_file" \
          exec -T "$service" psql -U "$POSTGRES_USER" -d "$db"
    sql_ok "[2/4] Mundo mágico carregado via fixture"
  else
    check_modelagem
    run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
      "$MODELAGEM_DIR/Games/magical world/ddl_game.sql" \
      "[2a/4] DDL mundo mágico"
    run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
      "$MODELAGEM_DIR/Games/magical world/dml_gama.sql" \
      "[2b/4] Dados mundo mágico"
    run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
      "$MODELAGEM_DIR/Games/magical world/dml_gama_patch.sql" \
      "[2c/4] Patches"
    run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
      "$MODELAGEM_DIR/Games/magical world/vw_ddl_game.sql" \
      "[2d/4] Views do jogo"
  fi

  # 3. Dados de teste (mínimo para os testes de integração passarem)
  run_sql "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
    "$BACKEND_DIR/tests/fixtures/data.sql" \
    "[3/4] Dados de teste (Desafios, Capítulos, Objetivos, Dicas)"

  # 4. Usuário de aplicação
  step "[4/4] Configurando usuário de aplicação (users_sql_challenge)"
  if [ -f "$MODELAGEM_DIR/PostgreSQL/Script/gestão/dcl_security.sql" ]; then
    cat "$MODELAGEM_DIR/PostgreSQL/Script/gestão/dcl_security.sql" \
      | sed "s/WITH PASSWORD 'senha123'/WITH PASSWORD '${POSTGRES_PASSWORD}'/" \
      | docker compose -f "$compose_file" --env-file "$env_file" \
          exec -T "$service" psql -U "$POSTGRES_USER" -d "$db" -v ON_ERROR_STOP=1
  else
    run_sql_inline "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file" \
      "DO \$\$ BEGIN
         IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'users_sql_challenge') THEN
           CREATE USER users_sql_challenge WITH PASSWORD '${POSTGRES_PASSWORD}';
         END IF;
       END \$\$;
       GRANT CONNECT ON DATABASE $db TO users_sql_challenge;
       GRANT USAGE ON SCHEMA public TO users_sql_challenge;
       GRANT USAGE ON SCHEMA magical_world TO users_sql_challenge;
       GRANT SELECT ON ALL TABLES IN SCHEMA public TO users_sql_challenge;
       GRANT SELECT ON ALL TABLES IN SCHEMA magical_world TO users_sql_challenge;" \
      "Usuário users_sql_challenge"
  fi
  sql_ok "[4/4] Usuário configurado"

  verify_db "$compose_file" "$service" "$POSTGRES_USER" "$db" "$env_file"
  ok "Banco de STAGING inicializado com sucesso"
}

# =============================================================================
#  MAIN
# =============================================================================
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║          SQL Challenge — Inicialização de Banco de Dados    ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Modo:      ${BOLD}$MODE${RESET}"
echo -e "  Reset:     ${BOLD}$RESET${RESET}"
echo -e "  Backend:   $BACKEND_DIR"
[ -n "$MODELAGEM_DIR" ] && echo -e "  Modelagem: $MODELAGEM_DIR"
echo ""

check_fixtures

case "$MODE" in
  production)
    init_production
    ;;
  staging)
    init_staging
    ;;
  all)
    init_production
    init_staging
    ;;
esac

# =============================================================================
#  Resumo
# =============================================================================
echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          ✅  BANCOS INICIALIZADOS COM SUCESSO               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

if [[ "$MODE" == "production" || "$MODE" == "all" ]]; then
  echo -e "  ${BOLD}Produção${RESET}  → db_gestao          (porta 5432)"
  echo "    Container: sql-challenge-db"
  echo "    Schemas:   public (gestão) + magical_world (jogo)"
  echo "    Usuários:  ${POSTGRES_USER} (admin) | users_sql_challenge (leitura)"
fi

if [[ "$MODE" == "staging" || "$MODE" == "all" ]]; then
  echo -e "  ${BOLD}Staging${RESET}   → db_gestao_staging   (porta 5433)"
  echo "    Container: sql-challenge-db-staging"
  echo "    Schemas:   public (gestão) + magical_world (jogo)"
  echo "    Usuários:  ${POSTGRES_USER} (admin) | users_sql_challenge (leitura)"
fi

echo ""
echo -e "${BOLD}Comandos úteis:${RESET}"
echo "  # Conectar ao banco de produção"
echo "  docker exec -it sql-challenge-db psql -U \$POSTGRES_USER -d db_gestao"
echo ""
echo "  # Conectar ao banco de staging"
echo "  docker exec -it sql-challenge-db-staging psql -U \$POSTGRES_USER -d db_gestao_staging"
echo ""
echo "  # Verificar tabelas"
echo "  docker exec -it sql-challenge-db psql -U \$POSTGRES_USER -d db_gestao -c '\\dt'"
echo "  docker exec -it sql-challenge-db psql -U \$POSTGRES_USER -d db_gestao -c '\\dt magical_world.*'"
echo ""
echo "  # Reset completo (⚠️ APAGA TUDO):"
echo "  bash scripts/db-init.sh --env production --reset"
echo "  bash scripts/db-init.sh --env staging --reset"
echo ""
