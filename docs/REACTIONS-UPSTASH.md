# Reações com Upstash Redis (nuvem)

Alternativa ao Supabase para reações **sempre na nuvem**.

## 1. Criar banco

1. Acesse [upstash.com](https://upstash.com/) e crie uma conta.
2. **Create Database** → região próxima (ex.: `us-east-1`).
3. Na página do banco, copie:
   - **REST URL** (`https://....upstash.io`)
   - **REST Token** (não use o Read-Only para reações — precisa gravar)

## 2. Configurar o blog

Edite `reactions.config.js`:

```js
window.REACTIONS_BACKEND = "upstash";
window.REACTIONS_UPSTASH_URL = "https://SEU-ENDPOINT.upstash.io";
window.REACTIONS_UPSTASH_TOKEN = "seu-token-rest";
```

## 3. Publicar

```bash
git add reactions.config.js
git commit -m "Ativar reações via Upstash"
git push
```

## 4. Testar

Abra um post, clique em um emoji, recarregue a página — a contagem deve persistir.

## Limites e segurança

- Plano grátis: ~10.000 comandos/dia (suficiente para blog pessoal).
- O token REST fica no JavaScript público; alguém mal-intencionado poderia inflar contadores. Para blog pessoal isso costuma ser aceitável.
- Se precisar de proteção extra, use um Cloudflare Worker como proxy (não incluído neste projeto).

## Voltar ao Supabase (padrão)

```js
window.REACTIONS_BACKEND = "supabase";
```
