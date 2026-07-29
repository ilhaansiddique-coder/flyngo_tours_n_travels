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
Coolify (on the server)
   ├─ Resource: flyngo (Docker Compose)   ← docker-compose.coolify.yml
   │   └─ pulls ghcr.io images, runs containers
   ├─ Service: flyngo-db    (PostgreSQL 16)
   ├─ Service: flyngo-redis (Redis 7)
   └─ Service: flyngo-meili (Meilisearch 1.12)
```

**Build ≠ Run.** GitHub Actions builds and pushes images on every push. Coolify
just pulls and runs them. This eliminates every "Coolify can't build this compose
file" class of bug permanently.

## One-time setup

### 1. GitHub — set workflow variables

Repo → **Settings** → **Secrets and variables** → **Actions** → **Variables** tab.
Create these:

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.flyngo.world/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `https://flyngo.world` |
| `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXX` *(optional)* |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` *(optional)* |
| `NEXT_PUBLIC_META_PIXEL_ID` | *(optional)* |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | *(optional)* |
| `NEXT_PUBLIC_CLARITY_ID` | *(optional)* |

`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` are **required** for the frontend build to bake in the right API base.

### 2. Make ghcr.io packages public (one click per package)

After the first workflow run pushes an image, visit:
- https://github.com/ilhaansiddique-coder?tab=packages → `flyngo-backend` → **Package settings** → **Change visibility** → **Public**
- Same for `flyngo-frontend`

This lets Coolify pull without a registry token. (Alternative: add a GitHub Personal Access Token to Coolify as a registry credential and keep images private.)

### 3. Coolify — provision stateful services

Coolify → `+ Add` → **Service** (one each):
- **PostgreSQL 16** — name `flyngo-db`, env `POSTGRES_USER=flyngo`, `POSTGRES_PASSWORD=...`, `POSTGRES_DB=flyngo`, persistent volume on `/var/lib/postgresql/data`
- **Redis 7** — name `flyngo-redis`, persistent volume on `/data`, set `REDIS_PASSWORD`
- **Meilisearch v1.12** — name `flyngo-meili`, env `MEILI_MASTER_KEY=...`, persistent volume on `/meili_data`

### 4. Coolify — add the app resource

**Projects** → `+ New` → `flyngo` → **+ New Resource** → **Docker Compose**:
- **Git Repo:** `ilhaansiddique-coder/flyngo_tours_n_travels`
- **Branch:** `main`
- **Base Directory:** *(empty)*
- **Docker Compose Location:** `docker-compose.coolify.yml`
- **Build Pack:** Docker Compose

### 5. Coolify — set FQDNs on each service

Click the resource, then each service:
- `frontend` → FQDN: `https://flyngo.world` (or your sslip.io URL while testing)
- `backend` → FQDN: `https://api.flyngo.world` (or matching sslip.io URL)

Coolify adds Traefik labels and TLS automatically.

### 6. Coolify — environment variables

Resource → **Environment Variables** → paste from `.env.coolify.example` and fill real values:
- `DATABASE_URL` — `postgresql://flyngo:<password>@flyngo-db:5432/flyngo?schema=public`
- `REDIS_HOST=flyngo-redis`, `REDIS_PASSWORD=...`
- `MEILISEARCH_HOST=http://flyngo-meili:7700`, `MEILISEARCH_API_KEY=...`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — `openssl rand -hex 32` each
- `FRONTEND_URL`, `ADMIN_URL`, plus the rest as needed

## Deploy flow (every release)

1. Push code to `main`
2. GitHub Actions builds both images (~3-5 min). Watch progress at **Actions** tab
3. Coolify auto-deploys on webhook (if configured) or click **Deploy** manually
4. Pull fresh images, restart containers — total downtime ~5 seconds

## First-run Prisma migration

After the first successful deploy:

```bash
docker exec -it flyngo-backend npx prisma migrate deploy
# optionally seed
docker exec -it flyngo-backend npx prisma db seed
```

## Rollback

```bash
# in Coolify, edit docker-compose.coolify.yml tag from :main to :sha-<commit>
# or use the Coolify "Rollback" UI to redeploy the previous image tag
```

## Common issues

| Symptom | Fix |
|---|---|
| Workflow fails at "Login to GitHub Container Registry" | Confirm `packages: write` permission is on the job (already set). If still failing, check that the repo's workflow permissions allow packages write (Settings → Actions → General → Workflow permissions → Read and write). |
| Coolify can't pull image | Make packages public (step 2) or add a GitHub PAT to Coolify's registry credentials. |
| Frontend shows wrong API URL | `NEXT_PUBLIC_API_URL` is baked at build time. Update the GitHub Variable, re-run the workflow, redeploy. |
| 404 page not found (Traefik) | FQDN not set on the service in Coolify, or container crashed. Check `docker ps` and the Coolify service logs. |
| Backend can't reach `flyngo-db` | Confirm the Service name in Coolify is exactly `flyngo-db` — that's the internal DNS name. |

## Local development

`docker-compose.yml` (the original) is for local dev. It bundles Postgres, Redis, Meili, backend, frontend, and nginx — run `docker compose up -d` and you have the full stack at `localhost:3000` / `localhost:4000`. The Coolify file is for production only.
