# Mural de Recados — configuração Supabase (grátis)

## 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com/) e crie uma conta.
2. **New project** → escolha nome e senha do banco.

## 2. Criar tabela

No painel: **SQL Editor** → cole e execute:

```sql
create table public.recados (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) >= 2 and char_length(nome) <= 80),
  recado text not null check (char_length(recado) >= 3 and char_length(recado) <= 500),
  created_at timestamptz not null default now()
);

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

O mural passa a listar e receber recados em tempo real.
