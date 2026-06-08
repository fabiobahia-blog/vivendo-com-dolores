# Mural de Recados — configuração Supabase (grátis)

Projeto deste blog: **gduyitvnnyuewwbebeyq** (org `vivendo-entre-dolores`).

- Dashboard: https://supabase.com/dashboard/project/gduyitvnnyuewwbebeyq
- Conexão, pooler e troubleshooting: [SUPABASE.md](SUPABASE.md)
- Guia para agentes de IA: [AGENTS.md](../AGENTS.md)

## 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com/) e crie uma conta.
2. **New project** → escolha nome e senha do banco.

## 2. Criar tabelas (mural + reações)

No painel: **SQL Editor** → cole e execute **tudo de uma vez**:

```sql
-- Mural de recados (post_slug null = recado geral; preenchido = recado em um post)
create table public.recados (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) >= 2 and char_length(nome) <= 80),
  recado text not null check (char_length(recado) >= 3 and char_length(recado) <= 500),
  post_slug text,
  created_at timestamptz not null default now()
);

create index recados_post_slug_created_at_idx
  on public.recados (post_slug, created_at desc);

alter table public.recados enable row level security;

create policy "Leitura publica de recados"
  on public.recados for select
  using (true);

create policy "Visitantes podem enviar recados"
  on public.recados for insert
  with check (
    char_length(nome) >= 2
    and char_length(recado) >= 3
  );

-- Reações nos posts (nuvem — contagem pública)
create table public.post_reactions (
  post_slug text not null,
  visitor_id text not null,
  reaction text not null check (
    reaction in ('like', 'love', 'haha', 'wow', 'sad', 'angry')
  ),
  created_at timestamptz not null default now(),
  primary key (post_slug, visitor_id)
);

alter table public.post_reactions enable row level security;

create policy "Leitura publica de reacoes"
  on public.post_reactions for select
  using (true);

create policy "Visitantes podem reagir"
  on public.post_reactions for insert
  with check (char_length(visitor_id) >= 8);

create policy "Visitantes podem atualizar sua reacao"
  on public.post_reactions for update
  using (true)
  with check (char_length(visitor_id) >= 8);

create policy "Visitantes podem remover sua reacao"
  on public.post_reactions for delete
  using (true);
```

## 3. Variáveis de ambiente (`.env`)

Na raiz do projeto, edite `.env` (copie de `.env.example` se não existir):

```bash
SUPABASE_DB_PASSWORD=sua-senha-do-banco
SUPABASE_API_URL=https://gduyitvnnyuewwbebeyq.supabase.co/rest/v1/
SUPABASE_PROJECT_URL=https://gduyitvnnyuewwbebeyq.supabase.co
MURAL_SUPABASE_URL=https://gduyitvnnyuewwbebeyq.supabase.co
MURAL_SUPABASE_ANON_KEY=sb_publishable_...   # Settings → API Keys → Publishable key
```

| Variável | Onde achar no Supabase |
|----------|-------------------------|
| `SUPABASE_DB_PASSWORD` | Senha definida ao criar o projeto (não aparece na tela de API) |
| `SUPABASE_API_URL` | Integrations → **Data API** → URL (`.../rest/v1/`) |
| `MURAL_SUPABASE_URL` | Mesma base, **sem** `/rest/v1/` → `https://gduyitvnnyuewwbebeyq.supabase.co` |
| `MURAL_SUPABASE_ANON_KEY` | Settings → **API Keys** → **Publishable key** |

A senha do banco **não** vai no site — só no `.env` local (administração).

## 4. Sincronizar com o site

```bash
chmod +x scripts/sync-mural-config.sh
./scripts/sync-mural-config.sh
```

Isso grava URL + chave publishable em `mural.config.js`.

## 5. Publicar

```bash
git add mural.config.js
git commit -m "Configurar mural de recados"
git push
```

O mural, os recados nos posts e as reações passam a funcionar na nuvem (Supabase).

## Recados nos posts (projeto já existente)

Se a tabela `recados` foi criada **antes** desta atualização, aplique a migration de `post_slug`:

```bash
chmod +x scripts/run-supabase-migration.sh
./scripts/run-supabase-migration.sh
```

Ou no **SQL Editor** do dashboard:

```sql
alter table public.recados
  add column if not exists post_slug text;

create index if not exists recados_post_slug_created_at_idx
  on public.recados (post_slug, created_at desc);
```

- `post_slug` vazio → recado geral no mural (`mural.html`)
- `post_slug` preenchido → recado ligado a um post; aparece no post e no mural (com indicação do post)

Verificação rápida (requer `.env` com `MURAL_SUPABASE_ANON_KEY`):

```bash
source .env
curl -s "https://gduyitvnnyuewwbebeyq.supabase.co/rest/v1/recados?select=post_slug&limit=1" \
  -H "apikey: $MURAL_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $MURAL_SUPABASE_ANON_KEY"
```

## Reações nos posts

Usam o mesmo Supabase do mural (`reactions.config.js` com `REACTIONS_BACKEND = "supabase"`). Se a tabela `post_reactions` ainda não existir, execute o bloco SQL acima.

Alternativa na nuvem: [Upstash Redis](REACTIONS-UPSTASH.md). Detalhes em [REACTIONS-ALTERNATIVES.md](REACTIONS-ALTERNATIVES.md).
