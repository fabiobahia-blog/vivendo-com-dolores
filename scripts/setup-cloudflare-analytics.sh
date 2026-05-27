#!/usr/bin/env bash
# Registra o blog no Cloudflare Web Analytics e grava o token em analytics.config.js
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
HOST="fabiobahia-blog.github.io"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a && source "$ENV_FILE" && set +a
fi

TOKEN="${CLOUDFLARE_API_TOKEN:-}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"

if [[ -z "$TOKEN" ]]; then
  echo "Erro: defina CLOUDFLARE_API_TOKEN no arquivo .env"
  echo "Crie em: https://dash.cloudflare.com/profile/api-tokens"
  echo "Permissão sugerida: Account → Account Analytics → Edit"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Erro: instale jq (brew install jq)"
  exit 1
fi

if [[ -z "$ACCOUNT_ID" ]]; then
  echo "Buscando Account ID..."
  ACCOUNT_ID="$(curl -fsS -H "Authorization: Bearer $TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts" | jq -r '.result[0].id // empty')"
  if [[ -z "$ACCOUNT_ID" ]]; then
    echo "Erro: não foi possível obter Account ID. Defina CLOUDFLARE_ACCOUNT_ID no .env"
    exit 1
  fi
  echo "Account ID: $ACCOUNT_ID"
fi

echo "Criando site Web Analytics para: $HOST"

RESPONSE="$(curl -fsS -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/rum/site_info" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"host\":\"${HOST}\",\"auto_install\":false}")"

SUCCESS="$(echo "$RESPONSE" | jq -r '.success')"
if [[ "$SUCCESS" != "true" ]]; then
  echo "Erro na API Cloudflare:"
  echo "$RESPONSE" | jq '.errors'
  exit 1
fi

SITE_TOKEN="$(echo "$RESPONSE" | jq -r '.result.site_token')"
if [[ -z "$SITE_TOKEN" || "$SITE_TOKEN" == "null" ]]; then
  echo "Erro: token não retornado."
  exit 1
fi

CONFIG_FILE="$ROOT_DIR/analytics.config.js"
cat > "$CONFIG_FILE" <<EOF
// Token do Cloudflare Web Analytics (gerado automaticamente)
window.CF_ANALYTICS_TOKEN = "${SITE_TOKEN}";
EOF

echo ""
echo "Sucesso!"
echo "Token: $SITE_TOKEN"
echo "Arquivo atualizado: analytics.config.js"
echo ""
echo "Próximo passo:"
echo "  cd \"$ROOT_DIR\" && git add analytics.config.js && git commit -m \"Configurar token Cloudflare Analytics\" && git push"
