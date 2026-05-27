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

## 3. Copiar credenciais

**Project Settings** → **API**:

- **Project URL** → `MURAL_SUPABASE_URL`
- **anon public** key → `MURAL_SUPABASE_ANON_KEY`

Edite `mural.config.js` na raiz do blog com esses valores.

## 4. Publicar

```bash
git add mural.config.js
git commit -m "Configurar mural de recados"
git push
```

O mural passa a listar e receber recados em tempo real.
