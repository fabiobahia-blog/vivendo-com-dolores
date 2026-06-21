# AI agent guide — Vivendo Entre Dolores

Static personal blog (PT-BR primary, EN-US via `lang.js`). Hosted on GitHub Pages. No build step — plain HTML, CSS, and vanilla JS.

## Quick facts

| Item | Value |
|------|--------|
| Live site | `https://fabiobahia-blog.github.io/vivendo-com-dolores` |
| GitHub repo | `fabiobahia-blog/vivendo-com-dolores` |
| Supabase org | `vivendo-entre-dolores` |
| Supabase project ref | `gduyitvnnyuewwbebeyq` |
| Supabase dashboard | https://supabase.com/dashboard/project/gduyitvnnyuewwbebeyq |

## Never commit

- `.env` — Supabase DB password, API keys, GitHub tokens
- `config.local.json` — same class of secrets
- Real credentials inside `mural.config.js` is acceptable for this project (publishable key only); regenerate via `scripts/sync-mural-config.sh` from `.env`

## Architecture

```
Browser (GitHub Pages)
  ├── lang.js + locales/*.json     → i18n (PT / EN)
  ├── mural.js + mural.config.js   → Guestbook + post messages (Supabase recados)
  ├── reactions.js                 → Post emoji reactions (Supabase post_reactions)
  ├── share.js + share-card.js     → Social share + short links
  └── links.config.js              → Short URL map (/l/{code}/)
```

**Guestbook / Mural de Recados**

- PT nav: **Deixar um Recado** (guestbook) / **Falar Comigo** (contact) — EN: **Share a Word** / **Speak with me**
- One Supabase table `recados` for all messages
- `post_slug IS NULL` → general message (from `mural.html`)
- `post_slug = '{slug}'` → message on that post; also shown on Guestbook with post label
- Post pages: section with `data-mural-section` + `data-post-slug="{slug}"`

**Posts**

- Path pattern: `{slug}/index.html`
- Template: `templates/post-template.html`
- Scaffold: `scripts/new-post.sh "<slug>" "<title>" "<date>"`
- Body attr: `data-post-slug="{slug}"` for reactions and messages

**Short links**

- `l/{code}/` → redirect to post (`templates/short-link-redirect.html`)
- `l/{code}/card/` → WhatsApp/social card (`templates/short-link-card.html`)
- Config: `links.config.js` — add entries via `scripts/new-short-link.sh`

## Supabase (admin)

Full connection details: [docs/SUPABASE.md](docs/SUPABASE.md)

**Website** (public, in `mural.config.js`):

- `MURAL_SUPABASE_URL` — project URL
- `MURAL_SUPABASE_ANON_KEY` — publishable key (`sb_publishable_...`)

**Local admin** (`.env` only):

- `SUPABASE_DB_PASSWORD` — database password from project creation
- Sync to site: `./scripts/sync-mural-config.sh`

**Run SQL migrations**

1. **Recommended:** `./scripts/run-supabase-migration.sh` (uses pooler from `.env`)
2. **Fallback:** Supabase dashboard → SQL Editor
3. **Verify column:** REST `GET .../recados?select=post_slug&limit=1` — must not return `column does not exist`

**DB pooler** (IPv4; direct `db.*.supabase.co` is IPv6-only):

```
Host: aws-1-sa-east-1.pooler.supabase.com
Port: 5432
User: postgres.gduyitvnnyuewwbebeyq
Database: postgres
```

## i18n conventions

- Strings in `locales/pt-BR.json` and `locales/en-US.json`
- HTML: `data-i18n="namespace.key"` on elements
- Post content: `posts.{slug}.title`, `.date`, `.p1`, etc.
- Post messages: `postMessages.*` — Guestbook cards use `postMessages.onPost` / `postMessages.toBlog`

When adding UI text, update **both** locale files.

## Common tasks

| Task | Action |
|------|--------|
| New post | `./scripts/new-post.sh` → edit HTML → add to `index.html` + locales |
| New short link | `./scripts/new-short-link.sh` |
| Sync Supabase to site | `./scripts/sync-mural-config.sh` |
| Post-slug migration | `./scripts/run-supabase-migration.sh` |
| Guestbook / mural setup | [docs/MURAL-SETUP.md](docs/MURAL-SETUP.md) |
| Prevent free-tier pause | [docs/SUPABASE.md](docs/SUPABASE.md) — cron-job.org keep-alive |

## Code style (this repo)

- Minimal diffs; match existing vanilla JS patterns (`mural.js`, `reactions.js`)
- Reuse CSS classes: `.mural-*`, `.reactions-section`, `.share-section`
- No frameworks, no bundler
- Comments only for non-obvious behavior

## Docs index

- [README.md](README.md) — human setup overview
- [docs/SUPABASE.md](docs/SUPABASE.md) — connection, migrations, verification
- [docs/MURAL-SETUP.md](docs/MURAL-SETUP.md) — first-time Supabase + table SQL
- [docs/REACTIONS-ALTERNATIVES.md](docs/REACTIONS-ALTERNATIVES.md) — reactions backends
