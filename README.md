# Blog pessoal no GitHub Pages

Blog simples, gratuito e com controle total do conteúdo.

## Arquivos

- `index.html` - Página inicial com lista de posts
- `sobre.html` - Apresentação
- `como-tudo-comecou/index.html` - Primeiro post com URL amigável
- `licoes-aprendidas.html` - Lições aprendidas desta jornada
- `style.css` - Estilo minimalista (fundo branco e letras pretas)
- `.env` - Credenciais locais (editável, não vai para o GitHub)
- `config.local.json` - Mesmas informações em JSON (editável, não vai para o GitHub)

## Configurar credenciais (local)

Edite um destes arquivos na raiz do projeto:

**Opção 1 — `.env`**

```bash
GITHUB_EMAIL=fbahia@hotmail.com
GITHUB_USERNAME=fabiobahia-blog
GITHUB_TOKEN=          # recomendado: token em github.com/settings/tokens
GITHUB_PASSWORD=       # ou senha, se preferir
GITHUB_REPO=fabio-sup
```

**Opção 2 — `config.local.json`**

Preencha `email`, `username`, `repo` e `token` (ou `password`).

Os arquivos `.env` e `config.local.json` estão no `.gitignore` e **nunca devem ser commitados**.

> **Segurança:** prefira `GITHUB_TOKEN` em vez de senha. Se você expôs a senha em algum chat, altere-a em [github.com/settings/security](https://github.com/settings/security).

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo: `meu-blog`).
2. Envie estes arquivos para a branch `main`.
3. No repositório, abra **Settings** > **Pages**.
4. Em **Build and deployment**, escolha:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` e pasta `/ (root)`
5. Salve e aguarde o link do site aparecer (normalmente em 1-3 minutos).

## Editar conteúdo

### Padrão de posts

- Todo post novo segue o formato: `slug-do-post/index.html`
- Modelo base: `templates/post-template.html`

### Criar post automaticamente

```bash
./scripts/new-post.sh "<slug>" "<titulo>" "<data>"
```

Exemplo:

```bash
./scripts/new-post.sh "aprendizados-no-hospital" "Aprendizados no hospital" "28 de maio de 2026"
```

Depois do comando:

1. Edite o conteúdo do arquivo criado.
2. Adicione o link do novo post em `index.html`.

## Cloudflare Web Analytics

### Opção A — Automático (recomendado)

1. Crie um API Token em [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)  
   Permissão: **Account → Account Analytics → Edit**
2. No `.env`, adicione:
   ```bash
   CLOUDFLARE_API_TOKEN=seu-token
   ```
3. Execute:
   ```bash
   chmod +x scripts/setup-cloudflare-analytics.sh
   ./scripts/setup-cloudflare-analytics.sh
   ```
4. Commit e push de `analytics.config.js`.

### Opção B — Manual no painel

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com/) → **Web Analytics** → **Add a site**.
2. Host: `fabiobahia-blog.github.io` (GitHub Pages).
3. Copie o **token** e coloque em `analytics.config.js`:
   ```js
   window.CF_ANALYTICS_TOKEN = "seu-token-aqui";
   ```
4. Commit e push.

Não é obrigatório mudar o DNS — basta o script no site.

### 3. Ver métricas

No painel Cloudflare: **Web Analytics** → selecione o site.

Métricas: visitas, páginas vistas, referência, país, dispositivo e navegador.

### Privacidade

O Cloudflare Web Analytics não usa cookies de publicidade e é mais leve em relação à privacidade que o GA4.

## Idioma (PT-BR / EN-US)

No topo de cada página: bandeiras 🇧🇷 e 🇺🇸 para alternar português e inglês.

- Traduções em `locales/pt-BR.json` e `locales/en-US.json`
- Preferência salva no navegador (`localStorage`)

## Mural de Recados

Página: `mural.html` — visitantes deixam **Nome** (obrigatório) e **Recado** (texto). Em inglês, o menu usa **Guestbook**.

Cada post também tem um formulário de recados no final da página. Recados gerais e recados de post compartilham a mesma tabela Supabase (`recados`); no mural, recados de post aparecem com o título do post.

Para salvar e exibir recados e reações na nuvem, configure o Supabase (grátis): veja [docs/MURAL-SETUP.md](docs/MURAL-SETUP.md).

Reações usam Supabase por padrão (`reactions.config.js`). Alternativa: [docs/REACTIONS-UPSTASH.md](docs/REACTIONS-UPSTASH.md).
