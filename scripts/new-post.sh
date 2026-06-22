#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Uso: ./scripts/new-post.sh <slug> \"<titulo>\" \"<data>\" [\"<resumo-og>\"]"
  echo "Exemplo: ./scripts/new-post.sh \"meu-post\" \"Meu post\" \"28 de maio de 2026\" \"Resumo de uma linha para redes sociais.\""
  exit 1
fi

SLUG="$1"
TITLE="$2"
DATE_STR="$3"
EXCERPT="${4:-Relato pessoal no blog Vivendo Entre Dolores.}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_PATH="$ROOT_DIR/templates/post-template.html"
POST_DIR="$ROOT_DIR/$SLUG"
POST_FILE="$POST_DIR/index.html"
SITE_ORIGIN="https://fabiobahia-blog.github.io/vivendo-com-dolores"

if [ -d "$POST_DIR" ]; then
  echo "Erro: a pasta '$SLUG' já existe."
  exit 1
fi

mkdir -p "$POST_DIR"
cp "$TEMPLATE_PATH" "$POST_FILE"

SLUG="$SLUG" TITLE="$TITLE" DATE_STR="$DATE_STR" EXCERPT="$EXCERPT" POST_URL="$SITE_ORIGIN/$SLUG/" perl -0777 -i -pe \
  's/\{\{POST_TITLE\}\}/$ENV{TITLE}/g; s/\{\{POST_DATE\}\}/$ENV{DATE_STR}/g; s/\{\{POST_SLUG\}\}/$ENV{SLUG}/g; s/\{\{POST_EXCERPT\}\}/$ENV{EXCERPT}/g; s/\{\{POST_URL\}\}/$ENV{POST_URL}/g' \
  "$POST_FILE"

echo "Post criado em: $POST_FILE"
echo ""
echo "Próximos passos:"
echo "  1. Edite o conteúdo do post"
echo "  2. Adicione o link em index.html"
echo "  3. Crie link curto: ./scripts/new-short-link.sh <codigo> \"$SLUG\" \"$TITLE\" \"$EXCERPT\""
echo "  4. Adicione legendas em docs/social-captions.json → posts.$SLUG"
echo "  5. Divulgue seguindo docs/DIVULGACAO-REDES.md"
