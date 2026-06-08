# Alternativas na nuvem para reações

Este projeto **não usa armazenamento local** para reações. Contagens e escolhas do visitante ficam sempre em serviço na nuvem.

## Padrão: Supabase (mesmo do mural)

- Backend: `REACTIONS_BACKEND = "supabase"` em `reactions.config.js`
- Credenciais: `mural.config.js` (URL + chave publishable)
- Setup: tabela `post_reactions` em [MURAL-SETUP.md](MURAL-SETUP.md)

## Alternativa: Upstash Redis

- Backend: `REACTIONS_BACKEND = "upstash"`
- Setup: [REACTIONS-UPSTASH.md](REACTIONS-UPSTASH.md)
- Útil se quiser separar reações do Supabase

## Alternativa: Giscus (GitHub Discussions)

- Reações via login GitHub
- Configure em [giscus.app](https://giscus.app)
- Conjunto de emojis fixo do GitHub (diferente dos 6 atuais)

## O que falta no seu projeto

O mural já funciona (`recados` existe). As reações falham porque **`post_reactions` ainda não foi criada**.

No Supabase → **SQL Editor**, execute o bloco de reações em [MURAL-SETUP.md](MURAL-SETUP.md) (ou [REACTIONS-SETUP.sql](REACTIONS-SETUP.sql)).
