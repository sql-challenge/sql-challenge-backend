#!/usr/bin/env bash
# =============================================================================
#  firebase-emulators-native.sh — Firebase local SEM Docker (alternativa)
# =============================================================================
#
#  Mesma função do firebase-emulators.sh (Docker), mas rodando o
#  firebase-tools direto na máquina. Requer:
#    • Node.js ≥ 20 (npx)
#    • Java 11+ (o emulador do Firestore roda em Java)
#
#  macOS (Homebrew):
#    brew install openjdk@21
#    export PATH="$(brew --prefix)/opt/openjdk@21/bin:$PATH"   # keg-only
#
#  Uso:
#    bash firebase/emulator/firebase-emulators-native.sh          # via npm run emulators:native
#    bash firebase/emulator/firebase-emulators-native.sh --clear  # apaga os dados locais antes
#
#  Portas: Auth 9099 · Firestore 8080 · UI 4000 (localhost)
#  Dados:  .emulator-data/ (persistente; importado ao subir, exportado ao encerrar)
#
#  Na versão nativa os emuladores escutam apenas em localhost
#  (firebase.json) — por isso o Docker usa firebase.docker.json com 0.0.0.0.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DATA_DIR="$BACKEND_DIR/.emulator-data"
PROJECT="demo-sql-challenge"
CONFIG="firebase/emulator/firebase.json"

# ─── Cores ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'
BOLD='\033[1m'; RESET='\033[0m'

warn() { echo -e "  ${YELLOW}⚠️  $*${RESET}"; }
err()  { echo -e "  ${RED}❌ $*${RESET}"; exit 1; }

# ─── Pré-requisitos ──────────────────────────────────────────────────────────
command -v npx >/dev/null 2>&1 || err "npx não encontrado — instale Node.js ≥ 20."

if ! command -v java >/dev/null 2>&1; then
  err "Java não encontrado (necessário para o emulador do Firestore).
   macOS (Homebrew):  brew install openjdk@21
                      export PATH=\"\$(brew --prefix)/opt/openjdk@21/bin:\$PATH\"
   Ou use o método Docker: npm run emulators"
fi

# ─── Reset opcional ──────────────────────────────────────────────────────────
if [ "${1:-}" = "--clear" ]; then
  warn "Limpando dados locais dos emuladores ($DATA_DIR)"
  rm -rf "$DATA_DIR"
  shift
fi

mkdir -p "$DATA_DIR"

echo -e "${CYAN}${BOLD}┌─ Firebase Emulators (dev) — nativo ────────────────${RESET}"
echo -e "  Auth:      http://localhost:9099"
echo -e "  Firestore: http://localhost:8080"
echo -e "  UI:        http://localhost:4000"
echo -e "  Dados:     $DATA_DIR (persistente)"
echo -e "  ${BOLD}Ctrl+C encerra e salva os dados${RESET}"

cd "$BACKEND_DIR"
exec npx --yes firebase-tools@latest emulators:start \
  --config "$CONFIG" \
  --only auth,firestore \
  --project "$PROJECT" \
  --import="$DATA_DIR" \
  --export-on-exit="$DATA_DIR" \
  "$@"
