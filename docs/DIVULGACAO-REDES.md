# Divulgação do blog nas redes sociais

Guia repetível para divulgar **cada novo post** do Vivendo Entre Dolores no WhatsApp, LinkedIn, Facebook e Instagram.

**Site:** https://fabiobahia-blog.github.io/vivendo-com-dolores/

---

## Links curtos dos posts atuais

| Post | Link curto | Cartão clicável (preview) |
|------|------------|---------------------------|
| Chegando no hospital | `/l/hospital/` | `/l/hospital/card/` |
| O dia em que descobri a trombose | `/l/trombose/` | `/l/trombose/card/` |
| Como tudo começou | `/l/comeco/` | `/l/comeco/card/` |

Base: `https://fabiobahia-blog.github.io/vivendo-com-dolores`

---

## Fase 1 — Preparar (antes de divulgar)

1. Publicar o post em `{slug}/index.html` e listar em `index.html`.
2. Criar link curto (atualiza `links.config.js` automaticamente):
   ```bash
   ./scripts/new-short-link.sh {codigo} {slug} "Título" "Resumo de uma linha"
   ```
3. Adicionar 4 legendas em `docs/social-captions.json` (`pt-BR` e opcionalmente `en-US`), com `{url}` no texto.
4. Confirmar meta Open Graph no `<head>` do post (título, descrição, URL).
5. Fazer push para GitHub Pages e aguardar deploy (~1–3 min).

---

## Fase 2 — Publicar (dia D)

Os textos **não aparecem no blog** — peça aqui no chat (Cursor) para copiar as legendas ou abrir os links de compartilhamento. As legendas ficam em [`docs/social-captions.json`](social-captions.json) (não são baixadas pelo site).

Ordem sugerida: **WhatsApp → LinkedIn → Facebook → Instagram** (~20–35 min).

### 1. WhatsApp (íntimo e direto)

**Onde:** grupos de família/amigos, contatos próximos, Status (opcional).

**Como:**
1. Peça no chat: *"texto WhatsApp do post {slug}"* ou *"poste no WhatsApp"*.
2. Cole a legenda (já inclui link curto) e envie aos contatos/grupos.

**Alternativa Status:** compartilhe o **cartão clicável** (`/l/{codigo}/card/`).

---

### 2. LinkedIn (reflexão e propósito)

**Como:**
1. Peça no chat a legenda LinkedIn do post.
2. Cole no LinkedIn → criar publicação → publique.

---

### 3. Facebook (acolhimento e comunidade)

**Como:**
1. Peça no chat a legenda Facebook ou o link de compartilhamento.
2. Revise o preview e publique.

---

### 4. Instagram (visual + descoberta)

**Como:**
1. Peça no chat a legenda Instagram e, se quiser, a imagem com QR code.
2. Publique a imagem no feed + legenda.
3. **Stories:** adesivo **Link** apontando para `/l/{codigo}/`.

---

## Checklist rápido (dia D)

- [ ] Pedir legendas no chat (WhatsApp, LinkedIn, Facebook, Instagram)
- [ ] WhatsApp enviado (contatos/grupos)
- [ ] LinkedIn publicado
- [ ] Facebook publicado
- [ ] Instagram feed + Stories (adesivo de link)

---

## Fase 3 — Acompanhar (7 dias após divulgação)

### Cloudflare Web Analytics

1. Acesse o dashboard do Cloudflare Web Analytics (token em `analytics.config.js`).
2. Compare visitas nos **7 dias** após a divulgação com a semana anterior.
3. Observe picos no dia D e D+1 (WhatsApp/Facebook costumam reagir rápido).
4. Verifique se há tráfego vindo de `/l/{codigo}/` (link curto compartilhado).

**O que registrar (opcional, em caderno ou planilha):**

| Data | Post | Rede | Observação |
|------|------|------|------------|
| | | WhatsApp | grupos X, Y |
| | | LinkedIn | N comentários |
| | | Facebook | |
| | | Instagram | feed + stories |

### Engajamento

- Responda comentários e DMs com o **link curto** do post.
- Convide leitores a deixar recado no **Mural** (`mural.html`) ou no final do post.
- **Não** republique o mesmo texto no WhatsApp sem motivo — evite spam.

---

## Calendário sugerido (posts existentes)

| Semana | Post | Foco |
|--------|------|------|
| 1 | Chegando no hospital | LinkedIn + Instagram |
| 2 | O dia em que descobri a trombose | Facebook + WhatsApp |
| 3 | Como tudo começou | Todas as redes (“conheça o blog”) |

Depois: **1 campanha por post novo** no dia da publicação + Stories opcional no dia 3.

---

## Ferramentas (repositório, não visíveis no site)

| Recurso | Onde |
|---------|------|
| Legendas por rede | `docs/social-captions.json` (interno, não no site) |
| Links curtos | `links.config.js` + `/l/{codigo}/` |
| Cartão clicável | `/l/{codigo}/card/` |
| Scripts de setup | `scripts/new-short-link.sh`, `share.js`, `share-card.js` (uso interno / chat) |
| Guia completo | Este arquivo |

---

## Limitações

- Publicação **automática** nas contas pessoais exige login manual — não há integração com APIs da Meta ou LinkedIn.
- Instagram feed: QR + legenda + Stories (não há link embutido na imagem).
- LinkedIn: legenda sempre via copiar/colar.
