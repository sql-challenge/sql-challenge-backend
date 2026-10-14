#!/usr/bin/env bash
# =============================================================================
#  firebase-emulators.sh — Firebase local (Auth + Firestore) para DEV
# =============================================================================
#
#  Sobe os emuladores locais do Firebase em Docker (não exige Java na
#  máquina). Em dev NUNCA use o projeto de produção: o backend recusa
#  iniciar em NODE_ENV=development apontando para a produção sem
#  emuladores (guard em firebaseAdminConfig.ts).
#
#  Uso:
#    bash firebase/emulator/firebase-emulators.sh          # via npm run emulators
#    bash firebase/emulator/firebase-emulators.sh --clear  # apaga os dados locais antes de subir
#
#  Portas:
#    Auth       9099   (connectAuthEmulator no frontend)
#    Firestore  8080
#    UI         4000   (http://localhost:4000 — contas, dados, logs)
#
#  Persistência:
#    Os dados ficam em .emulator-data/ (importados ao subir, exportados ao
#    encerrar com Ctrl+C). Para resetar: --clear ou apague a pasta.
#
#  Requisitos: Docker rodando (macOS + colima: `colima start`).
#  Imagem: sobrescreva com FIREBASE_TOOLS_IMAGE se necessário.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DATA_DIR="$BACKEND_DIR/.emulator-data"
PROJECT="demo-sql-challenge"
CONTAINER="sql-challenge-firebase-dev"
IMAGE="${FIREBASE_TOOLS_IMAGE:-andreysenov/firebase-tools:latest}"
CONFIG="firebase/emulator/firebase.docker.json"

# ─── Cores ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'
BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "  ${GREEN}✅ $*${RESET}"; }
warn() { echo -e "  ${YELLOW}⚠️  $*${RESET}"; }
err()  { echo -e "  ${RED}❌ $*${RESET}"; exit 1; }

# ─── Docker pronto? ──────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || err "Docker não encontrado — instale Docker Desktop ou colima."
docker info >/dev/null 2>&1 || err "Docker não está rodando (macOS + colima: \`colima start\`)."

# ─── Reset opcional ──────────────────────────────────────────────────────────
if [ "${1:-}" = "--clear" ]; then
  warn "Limpando dados locais dos emuladores ($DATA_DIR)"
  rm -rf "$DATA_DIR"
  shift
fi

# Garante o diretório de dados (import funciona mesmo vazio)
mkdir -p "$DATA_DIR"

# Remove container anterior com o mesmo nome (ex.: saída abrupta sem --rm)
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true

# TTY apenas quando interativo (Ctrl+C encerra e exporta os dados)
TTY_FLAG=()
[ -t 0 ] && TTY_FLAG=(-t)

echo -e "${CYAN}${BOLD}┌─ Firebase Emulators (dev) — Docker ────────────────${RESET}"
echo -e "  Auth:      http://localhost:9099"
echo -e "  Firestore: http://localhost:8080"
echo -e "  UI:        http://localhost:4000"
echo -e "  Dados:     $DATA_DIR (persistente)"
echo -e "  ${BOLD}Ctrl+C encerra e salva os dados${RESET}"

exec docker run --rm -i \
  "${TTY_FLAG[@]+"${TTY_FLAG[@]}"}" \
  --name "$CONTAINER" \
  --entrypoint /usr/local/bin/firebase \
  -v "$BACKEND_DIR:/workspace" \
  -w /workspace \
  -p 9099:9099 \
  -p 8080:8080 \
  -p 4000:4000 \
  -p 4400:4400 \
  -p 9150:9150 \
  "$IMAGE" \
  emulators:start \
    --config "$CONFIG" \
    --only auth,firestore \
    --project "$PROJECT" \
    --import=/workspace/.emulator-data \
    --export-on-exit=/workspace/.emulator-data \
    "$@"
