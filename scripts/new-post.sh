#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Uso: ./scripts/new-post.sh <slug> \"<titulo>\" \"<data>\""
  echo "Exemplo: ./scripts/new-post.sh \"meu-segundo-post\" \"Meu segundo post\" \"28 de maio de 2026\""
  exit 1
fi

SLUG="$1"
TITLE="$2"
DATE_STR="$3"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_PATH="$ROOT_DIR/templates/post-template.html"
POST_DIR="$ROOT_DIR/$SLUG"
POST_FILE="$POST_DIR/index.html"

if [ -d "$POST_DIR" ]; then
  echo "Erro: a pasta '$SLUG' já existe."
  exit 1
fi

mkdir -p "$POST_DIR"
cp "$TEMPLATE_PATH" "$POST_FILE"

TITLE="$TITLE" DATE_STR="$DATE_STR" perl -0777 -i -pe 's/\{\{POST_TITLE\}\}/$ENV{TITLE}/g; s/\{\{POST_DATE\}\}/$ENV{DATE_STR}/g' \
  "$POST_FILE"

echo "Post criado em: $POST_FILE"
echo "Próximo passo: adicione o link em index.html"
