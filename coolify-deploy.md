# Flyngo — Coolify Deployment

## Architecture

```
git push origin main
        │
        ▼
GitHub Actions ──┬─ backend.yml  → build & push ghcr.io/.../flyngo-backend:main
                 └─ frontend.yml → build & push ghcr.io/.../flyngo-frontend:main
        │
        ▼
CI triggers Coolify deploy webhook (COOLIFY_DEPLOY_WEBHOOK)
        │
        ▼
Coolify (on the server)
   ├─ Resource: flyngo (Docker Compose)   ← docker-compose.yml (pulls images)
   │   └─ pulls ghcr.io images, runs containers
   ├─ Service: flyngo-db    (PostgreSQL 16)
   ├─ Service: flyngo-redis (Redis 7)
   └─ Service: flyngo-meili (Meilisearch 1.12)
```

**Build ≠ Run.** GitHub Actions builds and pushes images on every push. Coolify
just pulls and runs them. No builds happen on the server.

## One-time setup

### 1. GitHub — set Actions Variables

Repo → **Settings** → **Secrets and variables** → **Actions** → **Variables** tab.
Create these:

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://flyngo.world` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` *(optional)* |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(optional)* |
| `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXX` *(optional)* |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` *(optional)* |
| `NEXT_PUBLIC_META_PIXEL_ID` | *(optional)* |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | *(optional)* |
| `NEXT_PUBLIC_CLARITY_ID` | *(optional)* |
| `COOLIFY_DEPLOY_WEBHOOK` | `https://<your-coolify>/webhooks/deploy/<uuid>` |

`COOLIFY_DEPLOY_WEBHOOK` enables **instant auto-deploy** — CI fires the deploy webhook the moment it finishes pushing the new Docker image. Get the URL from Coolify → your resource → Deploy Webhooks → copy.

### 2. Make ghcr.io packages public (one click per package)

After the first workflow run pushes an image, visit:
- https://github.com/ilhaansiddique-coder?tab=packages → `flyngo-backend` → **Package settings** → **Change visibility** → **Public**
- Same for `flyngo-frontend`

This lets Coolify pull without a registry token.

### 3. Coolify — provision stateful services

Coolify → `+ Add` → **Service** (one each):
- **PostgreSQL 16** — name `flyngo-db`, env `POSTGRES_USER=flyngo`, `POSTGRES_PASSWORD=...`, `POSTGRES_DB=flyngo`, persistent volume on `/var/lib/postgresql/data`
- **Redis 7** — name `flyngo-redis`, persistent volume on `/data`, set `REDIS_PASSWORD`
- **Meilisearch v1.12** — name `flyngo-meili`, env `MEILI_MASTER_KEY=...`, persistent volume on `/meili_data`

### 4. Coolify — add the app resource

**Projects** → `+ New` → `flyngo` → **+ New Resource** → **Docker Compose**:
- **Git Repo:** `ilhaansiddique-coder/flyngo_tours_n_travels`
- **Branch:** `main`
- **Base Directory:** *(empty — defaults to repo root)*
- **Docker Compose Location:** `docker-compose.yml`
- **Build Pack:** Docker Compose

⚠️ Make sure Coolify uses `docker-compose.yml` (the default). This file pulls pre-built images from ghcr.io — it does NOT build. If Coolify is set to a different file, change it.

### 5. Coolify — set FQDNs on each service

Click the resource, then each service:
- `frontend` → FQDN: `https://flyngo.world`
- `backend` → FQDN: `https://api.flyngo.world`

Coolify adds Traefik labels and TLS automatically.

### 6. Coolify — environment variables

Resource → **Environment Variables** → add these:
- `DATABASE_URL` — `postgresql://flyngo:<password>@flyngo-db:5432/flyngo?schema=public`
- `REDIS_HOST=flyngo-redis`, `REDIS_PASSWORD=...`
- `MEILISEARCH_HOST=http://flyngo-meili:7700`, `MEILISEARCH_API_KEY=...`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — `openssl rand -hex 32` each
- `FRONTEND_URL=https://flyngo.world`
- `ADMIN_URL=https://flyngo.world`
- Plus any payment/service keys you use

These override the defaults in `docker-compose.yml`.

## Deploy flow (every push)

1. Push code to `main`
2. GitHub Actions builds both images (~3-5 min)
3. CI triggers Coolify deploy webhook → Coolify pulls new images and redeploys
4. Backend auto-runs `prisma migrate deploy` on startup — no manual steps
5. Total downtime: ~5 seconds

## Rollback

```bash
# In the Coolify "Rollback" UI, select the previous image tag.
# Or edit docker-compose.yml, change :main to :sha-<previous-commit>, redeploy.
```

## Common issues

| Symptom | Fix |
|---|---|
| Workflow login fails | Repo → Settings → Actions → General → Workflow permissions → "Read and write". |
| Coolify can't pull image | Make ghcr.io packages public (step 2) or add a GitHub PAT to Coolify. |
| 404 on pages | FQDN not set on service in Coolify, or container crashed. Check logs. |
| Backend can't reach DB | Service name must be exactly `flyngo-db` — that's the internal DNS name. |
| Auto-deploy not firing | Get webhook URL from Coolify → Resource → Deploy Webhooks → paste as `COOLIFY_DEPLOY_WEBHOOK` in GitHub Variables. |
| Migration fails on startup | Check `docker logs flyngo-backend`. Verify `DATABASE_URL` in Coolify env vars. |

## Local development

```bash
# Option 1: Root-level single command (needs local Postgres + Redis)
npm run dev             # starts backend + frontend in watch mode

# Option 2: Full Docker stack (Postgres, Redis, Meilisearch included)
npm run docker:dev      # build from source, start everything
npm run docker:up       # pull pre-built images from ghcr.io
npm run docker:down     # stop everything
```
