#!/bin/bash
# =============================================================================
#  setup-env.sh — Cria o .env.production no servidor (caminho manual)
# =============================================================================
#  Não há segredos neste arquivo. Exporte-os antes de rodar:
#
#    export FIREBASE_ADMIN_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
#    export EMAIL_PASS='...'          # opcional
#    bash setup-env.sh
#
#  Dica: guarde os segredos em um arquivo FORA do git e faça:
#    set -a; source ~/sql-challenge-secrets.env; set +a; bash setup-env.sh
#
#  Fluxo normal: o CD (.github/workflows/cd.yml) gera o .env.production
#  a partir dos GitHub Secrets — este script é o caminho manual/legado.
# =============================================================================
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/apps/sql-challenge/backend/.env.production}"

: "${FIREBASE_ADMIN_PRIVATE_KEY:?exporte FIREBASE_ADMIN_PRIVATE_KEY antes de rodar (veja o cabeçalho deste script)}"

mkdir -p "$(dirname "$ENV_FILE")"

cat > "$ENV_FILE" <<EOF
PORT=3000
NODE_ENV=production
apiKey=AIzaSyCjcUNiPRfL20Di5Yd6gRCcVPeOBpnG9IE
authDomain=sqlmystery.firebaseapp.com
projectId=sqlmystery
storageBucket=sqlmystery.firebasestorage.app
messagingSenderId=813818123752
appId=1:813818123752:web:355985fbe43bf1237d005d
measurementId=G-KD09159NHG
FIREBASE_ADMIN_PROJECT_ID=sqlmystery
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sqlmystery.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="${FIREBASE_ADMIN_PRIVATE_KEY}"
FRONTEND_URL=https://apihub-macedo.duckdns.org
FRONTEND_PORT=3001
EMAIL_USER=sqlmysterycimatec@gmail.com
EMAIL_PASS=${EMAIL_PASS:-}
SITE_URL=https://apihub-macedo.duckdns.org/sql-challenge
EOF
chmod 600 "$ENV_FILE"

echo "✓ $ENV_FILE criado com sucesso"
echo "--- Verificando chave ---"
grep "FIREBASE_ADMIN_PRIVATE_KEY" "$ENV_FILE" | head -c 80
echo ""

# Sobe os containers
cd /opt/apps/sql-challenge/backend
sudo docker compose --env-file .env.production up -d --force-recreate

sleep 8
sudo docker ps
