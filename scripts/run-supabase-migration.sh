#!/usr/bin/env bash
# Aplica migrations Supabase idempotentes (post_slug) via Session pooler.
# Requer: .env com SUPABASE_DB_PASSWORD
# Opcional: psql (brew install libpq) ou Node com pacote pg (instalado em /tmp pelo script)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

PROJECT_REF="gduyitvnnyuewwbebeyq"
POOLER_HOST="aws-1-sa-east-1.pooler.supabase.com"
POOLER_PORT="5432"
POOLER_USER="postgres.${PROJECT_REF}"

SQL=$(cat <<'EOSQL'
alter table public.recados
  add column if not exists post_slug text;

create index if not exists recados_post_slug_created_at_idx
  on public.recados (post_slug, created_at desc);
EOSQL
)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Erro: crie .env (cp .env.example .env) e defina SUPABASE_DB_PASSWORD"
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Erro: defina SUPABASE_DB_PASSWORD no .env"
  exit 1
fi

run_psql() {
  local psql_bin="$1"
  PGPASSWORD="$SUPABASE_DB_PASSWORD" "$psql_bin" \
    "host=${POOLER_HOST} port=${POOLER_PORT} dbname=postgres user=${POOLER_USER} sslmode=require" \
    -v ON_ERROR_STOP=1 \
    -c "$SQL" \
    -c "select column_name from information_schema.columns where table_schema='public' and table_name='recados' order by ordinal_position;"
}

PSQL=""
for candidate in psql /opt/homebrew/opt/libpq/bin/psql /usr/local/opt/libpq/bin/psql; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PSQL="$candidate"
    break
  fi
done

if [[ -n "$PSQL" ]]; then
  echo "Usando psql: $PSQL"
  echo "Pooler: ${POOLER_HOST}:${POOLER_PORT}"
  run_psql "$PSQL"
  echo "Migration concluída."
  exit 0
fi

echo "psql não encontrado; tentando Node + pg..."
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
(cd "$TMP_DIR" && npm install pg --silent >/dev/null 2>&1)

SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD" node <<'NODE'
const { Client } = require("pg");

const sql = `
alter table public.recados
  add column if not exists post_slug text;

create index if not exists recados_post_slug_created_at_idx
  on public.recados (post_slug, created_at desc);
`;

const client = new Client({
  host: "aws-1-sa-east-1.pooler.supabase.com",
  port: 5432,
  user: "postgres.gduyitvnnyuewwbebeyq",
  password: process.env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  await client.query(sql);
  const res = await client.query(
    "select column_name from information_schema.columns where table_schema='public' and table_name='recados' order by ordinal_position"
  );
  console.log("Colunas em recados:", res.rows.map((r) => r.column_name).join(", "));
  await client.end();
})().catch((err) => {
  console.error("Falha na migration:", err.message);
  process.exit(1);
});
NODE

echo "Migration concluída."
