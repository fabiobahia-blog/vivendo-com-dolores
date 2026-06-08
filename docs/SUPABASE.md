# Supabase — conexão e operações

Referência para humanos e agentes de IA. Credenciais reais ficam em `.env` (não commitar).

## Projeto

| Campo | Valor |
|-------|--------|
| Organização | `vivendo-entre-dolores` |
| Project ref | `gduyitvnnyuewwbebeyq` |
| Dashboard | https://supabase.com/dashboard/project/gduyitvnnyuewwbebeyq |
| API URL (REST) | `https://gduyitvnnyuewwbebeyq.supabase.co/rest/v1/` |
| Project URL (JS client) | `https://gduyitvnnyuewwbebeyq.supabase.co` |
| Região (pooler) | `sa-east-1` (`aws-1`) |

## Duas formas de “conectar”

### 1. Site (navegador) — chave pública

Usado por `mural.js`, `reactions.js`. Gerado em `mural.config.js`:

```bash
cp .env.example .env   # preencher MURAL_SUPABASE_* 
./scripts/sync-mural-config.sh
```

| `.env` | Uso |
|--------|-----|
| `MURAL_SUPABASE_URL` | URL do projeto |
| `MURAL_SUPABASE_ANON_KEY` | Settings → API Keys → **Publishable key** |

No painel: **Project Settings → API Keys**.

### 2. Administração (migrations, SQL) — senha do banco

| `.env` | Uso |
|--------|-----|
| `SUPABASE_DB_PASSWORD` | Senha definida ao criar o projeto |

**Nunca** colocar a senha do banco no site nem em commits.

## Conexão PostgreSQL (CLI / scripts)

O host direto `db.gduyitvnnyuewwbebeyq.supabase.co` resolve só em **IPv6**. Em redes IPv4 use o **Session pooler**:

```
Host:     aws-1-sa-east-1.pooler.supabase.com
Port:     5432
User:     postgres.gduyitvnnyuewwbebeyq
Database: postgres
Password: (SUPABASE_DB_PASSWORD no .env)
SSL:      require
```

No painel: **Project Settings → Database → Connection string → Session pooler**.

### psql (exemplo)

```bash
source .env
export PGPASSWORD="$SUPABASE_DB_PASSWORD"
psql "host=aws-1-sa-east-1.pooler.supabase.com port=5432 dbname=postgres user=postgres.gduyitvnnyuewwbebeyq sslmode=require"
```

Requer cliente PostgreSQL (`brew install libpq`, depois `/opt/homebrew/opt/libpq/bin/psql`).

### Script do repositório

```bash
./scripts/run-supabase-migration.sh
```

Aplica a migration `post_slug` (idempotente). Usa `.env` e o pooler acima.

## Migrations

### Migration atual: `post_slug` em `recados`

```sql
alter table public.recados
  add column if not exists post_slug text;

create index if not exists recados_post_slug_created_at_idx
  on public.recados (post_slug, created_at desc);
```

**Opções para executar:**

1. `./scripts/run-supabase-migration.sh`
2. Dashboard → **SQL Editor** → colar SQL → **Run**
3. `psql` com pooler (acima)

### Verificar se a migration rodou

```bash
source .env
curl -s "https://gduyitvnnyuewwbebeyq.supabase.co/rest/v1/recados?select=post_slug&limit=1" \
  -H "apikey: $MURAL_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $MURAL_SUPABASE_ANON_KEY"
```

- Sucesso: JSON com `"post_slug": null` ou um slug
- Falha: `"column recados.post_slug does not exist"`

## Tabelas

### `recados` (Guestbook + mensagens nos posts)

| Coluna | Tipo | Notas |
|--------|------|--------|
| `id` | uuid | PK |
| `nome` | text | 2–80 chars |
| `recado` | text | 3–500 chars |
| `post_slug` | text, nullable | `null` = mural geral |
| `created_at` | timestamptz | |

### `post_reactions`

| Coluna | Tipo | Notas |
|--------|------|--------|
| `post_slug` | text | |
| `visitor_id` | text | localStorage UUID |
| `reaction` | text | like, love, haha, wow, sad, angry |

SQL completo de criação: [MURAL-SETUP.md](MURAL-SETUP.md).

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `could not translate host name db.*` | Usar pooler `aws-1-sa-east-1.pooler.supabase.com`, não o host `db.*` |
| `tenant/user postgres.* not found` | Região ou prefixo pooler errado — este projeto usa `aws-1-sa-east-1` |
| Formulário desabilitado no site | Rodar `sync-mural-config.sh`; conferir publishable key no Supabase |
| Mensagem de post não aparece | Confirmar migration `post_slug`; conferir `data-post-slug` no HTML |

## Links

- [MURAL-SETUP.md](MURAL-SETUP.md) — setup inicial
- [REACTIONS-ALTERNATIVES.md](REACTIONS-ALTERNATIVES.md) — backend de reações
- [AGENTS.md](../AGENTS.md) — guia para agentes de IA
