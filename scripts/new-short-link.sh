#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Uso: ./scripts/new-short-link.sh <codigo> <post-slug> \"<titulo>\" \"<resumo>\""
  echo "Exemplo: ./scripts/new-short-link.sh trombose o-dia-em-que-descobri-a-trombose \"O dia em que descobri a trombose\" \"A ligação do médico...\""
  exit 1
fi

CODE="$1"
POST_SLUG="$2"
TITLE="$3"
EXCERPT="$4"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SITE_ORIGIN="https://fabiobahia-blog.github.io/vivendo-com-dolores"
LINK_DIR="$ROOT_DIR/l/$CODE"
CARD_DIR="$LINK_DIR/card"
REDIRECT_TEMPLATE="$ROOT_DIR/templates/short-link-redirect.html"
CARD_TEMPLATE="$ROOT_DIR/templates/short-link-card.html"
LINKS_CONFIG="$ROOT_DIR/links.config.js"

if [ -d "$LINK_DIR" ]; then
  echo "Erro: o link curto '$CODE' já existe em l/$CODE/"
  exit 1
fi

if [ ! -f "$ROOT_DIR/$POST_SLUG/index.html" ]; then
  echo "Erro: post não encontrado em $POST_SLUG/index.html"
  exit 1
fi

TARGET_REL="../../$POST_SLUG/"
TARGET_ABS="$SITE_ORIGIN/$POST_SLUG/"
SHORT_URL="$SITE_ORIGIN/l/$CODE/"

mkdir -p "$CARD_DIR"

CODE="$CODE" TITLE="$TITLE" EXCERPT="$EXCERPT" TARGET_REL="$TARGET_REL" TARGET_ABS="$TARGET_ABS" SHORT_URL="$SHORT_URL" perl -0777 -pe \
  's/\{\{LINK_TITLE\}\}/$ENV{TITLE}/g; s/\{\{LINK_EXCERPT\}\}/$ENV{EXCERPT}/g; s/\{\{TARGET_REL\}\}/$ENV{TARGET_REL}/g; s/\{\{TARGET_ABS\}\}/$ENV{TARGET_ABS}/g; s/\{\{SHORT_URL\}\}/$ENV{SHORT_URL}/g' \
  "$REDIRECT_TEMPLATE" > "$LINK_DIR/index.html"

CODE="$CODE" TITLE="$TITLE" EXCERPT="$EXCERPT" TARGET_REL="$TARGET_REL" TARGET_ABS="$TARGET_ABS" SHORT_URL="$SHORT_URL" perl -0777 -pe \
  's/\{\{LINK_TITLE\}\}/$ENV{TITLE}/g; s/\{\{LINK_EXCERPT\}\}/$ENV{EXCERPT}/g; s/\{\{TARGET_REL\}\}/$ENV{TARGET_REL}/g; s/\{\{TARGET_ABS\}\}/$ENV{TARGET_ABS}/g; s/\{\{SHORT_URL\}\}/$ENV{SHORT_URL}/g' \
  "$CARD_TEMPLATE" > "$CARD_DIR/index.html"

TITLE_JS=$(printf '%s' "$TITLE" | perl -pe 's/\\/\\\\/g; s/"/\\"/g')
EXCERPT_JS=$(printf '%s' "$EXCERPT" | perl -pe 's/\\/\\\\/g; s/"/\\"/g')

if grep -q "    $CODE:" "$LINKS_CONFIG"; then
  echo "Aviso: entrada '$CODE' já existe em links.config.js — pulando atualização."
else
  ENTRY=$(cat <<EOF

    $CODE: {
      postSlug: "$POST_SLUG",
      title: "$TITLE_JS",
      excerpt:
        "$EXCERPT_JS",
    },
EOF
)
  export ENTRY
  perl -0777 -i -pe 's/\n  \},\n  getByPostSlug: function/$ENV{ENTRY}\n  },\n  getByPostSlug: function/s' "$LINKS_CONFIG"
  echo "Entrada adicionada em links.config.js"
fi

echo ""
echo "Link curto: $SHORT_URL"
echo "Cartão clicável: ${SHORT_URL}card/"
echo "Redirect criado em: l/$CODE/"
echo ""
echo "Próximos passos:"
echo "  1. Adicione legendas em docs/social-captions.json → posts.$POST_SLUG"
echo "  2. Siga docs/DIVULGACAO-REDES.md para publicar nas redes"
