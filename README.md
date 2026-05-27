# Blog pessoal no GitHub Pages

Blog simples, gratuito e com controle total do conteúdo.

## Arquivos

- `index.html` - Página inicial com lista de posts
- `sobre.html` - Apresentação
- `como-tudo-comecou/index.html` - Primeiro post com URL amigável
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

### 1. Criar site no Cloudflare

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com/) e crie uma conta (grátis).
2. Vá em **Web Analytics** → **Add a site**.
3. Informe a URL: `https://fabiobahia-blog.github.io/vivendo-com-dolores/`
4. Copie o **token** do snippet (campo `token` dentro de `data-cf-beacon`).

Não é obrigatório mudar o DNS do domínio para GitHub Pages — basta o script no site.

### 2. Configurar no blog

Edite `analytics.config.js`:

```js
window.CF_ANALYTICS_TOKEN = "seu-token-aqui";
```

Faça commit e push. O script só carrega quando o token for válido (não pode ficar com `COLE_SEU_TOKEN_AQUI`).

### 3. Ver métricas

No painel Cloudflare: **Web Analytics** → selecione o site.

Métricas: visitas, páginas vistas, referência, país, dispositivo e navegador.

### Privacidade

O Cloudflare Web Analytics não usa cookies de publicidade e é mais leve em relação à privacidade que o GA4.
