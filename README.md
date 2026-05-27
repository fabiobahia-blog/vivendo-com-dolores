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

- Para criar novo post, crie uma pasta com slug (exemplo `meu-novo-post/`) e um `index.html` dentro.
- Depois ajuste:
  - título da página (`<title>`)
  - título do post (`<h2>`)
  - data e texto
- Depois adicione o link do novo post em `index.html`.
