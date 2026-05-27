#!/usr/bin/env bash
# Lê .env e atualiza mural.config.js (URL + chave publishable para o site)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
OUT_FILE="$ROOT_DIR/mural.config.js"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Erro: crie o arquivo .env (cp .env.example .env)"
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

URL="${MURAL_SUPABASE_URL:-$SUPABASE_PROJECT_URL}"
KEY="${MURAL_SUPABASE_ANON_KEY:-}"

if [[ -z "$URL" ]]; then
  echo "Erro: defina MURAL_SUPABASE_URL ou SUPABASE_PROJECT_URL no .env"
  exit 1
fi

if [[ -z "$KEY" ]]; then
  echo "Aviso: MURAL_SUPABASE_ANON_KEY vazio — cole a Publishable key do Supabase no .env"
fi

cat > "$OUT_FILE" <<EOF
// Gerado por scripts/sync-mural-config.sh — não edite manualmente se usar o script
window.MURAL_SUPABASE_URL = "${URL}";
window.MURAL_SUPABASE_ANON_KEY = "${KEY}";
EOF

echo "Atualizado: mural.config.js"
echo "  URL: ${URL}"
