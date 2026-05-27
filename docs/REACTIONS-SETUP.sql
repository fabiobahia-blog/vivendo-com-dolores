-- Execute no Supabase → SQL Editor (uma vez)

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
