# 🚀 Deploying MockMate AI

**Frontend → Netlify · Backend → Render · DB → Supabase (already live)**

Total manual work: ~6 paste-in values. Everything else is automated by
`render.yaml` (Render Blueprint) and `netlify.toml` (Netlify config).

---

## Architecture

```
Browser ──> https://your-site.netlify.app
              ├─ /*          → Vite SPA (React)
              └─ /api/*      → proxied to https://mockmate-api.onrender.com
                                  └─> Supabase Postgres + Gemini
```

The `/api/*` proxy in `netlify.toml` makes auth requests **same-origin**,
so Better Auth session cookies just work — no CORS or cookie hacks needed
in production (this avoids Safari/third-party cookie blocking).

---

## Step 0 — Push this repo to GitHub

The folder is not a git repo yet (`.env` files are already gitignored):

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/mockmate.git
git push -u origin main
```

## Step 1 — Deploy the frontend (Netlify)

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Netlify reads `netlify.toml` automatically (base `client`, publish `dist`) — no other settings needed.
3. Deploy. You'll get a URL like `https://random-name.netlify.app`.

No environment variables are needed on Netlify — in production the app
calls its own origin and Netlify proxies `/api/*` to Render.

## Step 2 — Deploy the backend (Render)

1. Render → **New + → Blueprint** → select the repo.
2. Render reads `render.yaml` and prompts you to fill:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Supabase → Project Settings → Database → URI (the one in `server/.env`) |
   | `GEMINI_API_KEY` | your Google AI Studio key (the one in `server/.env`) |
   | `CLIENT_URL` | your Netlify URL from Step 1, e.g. `https://random-name.netlify.app` |
   | `BETTER_AUTH_URL` | `https://mockmate-api.onrender.com` (the service name is pinned in `render.yaml`) |

   `BETTER_AUTH_SECRET` is generated automatically.
3. **Apply** → Render builds and starts the API. Verify `https://mockmate-api.onrender.com/api/health` returns `{"success":true,...}`.

> If the name `mockmate-api` is taken, Render will assign a different URL —
> use the URL Render shows in both places in Step 3.

> If the DB connection fails from Render (rare), swap `DATABASE_URL` for
> the **Session pooler** string from the same Supabase page
> (`...pooler.supabase.com:5432...`).

## Step 3 — Point Netlify's proxy at Render

Edit **one line** in `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://mockmate-api.onrender.com/api/:splat"   # ← your Render URL
```

Commit and push — Netlify redeploys automatically.

## Step 4 — Test

Open your Netlify URL and sign up / log in. Signup, login, session
persistence, and Gemini interviews all go through the proxy.

---

## Notes

- **DB schema is already live** in Supabase (pushed locally with
  `prisma db push`). For future schema changes, run `npm run db:push`
  locally against the same `DATABASE_URL` — no migration step on Render.
- **Render free tier** spins the API down after ~15 min idle; the first
  request after that takes ~30–60s. Ping the health URL or upgrade the
  plan if that's an issue.
- **Secrets:** `server/.env` and `client/.env` are gitignored — local
  values never reach GitHub. Production values live only in
  Render/Netlify dashboards.
- Changing `CLIENT_URL` or `BETTER_AUTH_URL` later: update the env var in
  the Render dashboard and redeploy.
