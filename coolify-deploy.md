# Flyngo — Coolify Deployment

## Architecture

```
git push origin main
        │
        ▼
GitHub Actions (ci.yml)
   ├─ backend lint/unit + migrated PostgreSQL integration + production build
   ├─ frontend lint/unit + production build + Chromium/Firefox against local API
   └─ Release verification
        ├─ backend.yml  → publish verified flyngo-backend:main
        └─ frontend.yml → publish verified flyngo-frontend:main
        │
        ▼
CI records a manual handoff (or triggers Coolify when webhook mode is enabled)
        │
        ▼
Coolify (on the server)
   ├─ Resource: flyngo (Docker Compose)   ← docker-compose.yml (pulls images)
   │   └─ pulls ghcr.io images, runs containers
   ├─ Service: flyngo-db    (PostgreSQL 16)
   ├─ Service: flyngo-redis (Redis 7)
   └─ Service: flyngo-meili (Meilisearch 1.12)
```

GitHub Actions verifies and publishes images. The current repository variable
`COOLIFY_DEPLOY_MODE=manual` leaves the live rollout to the existing Coolify
resource. The Compose file includes both image and build definitions; Coolify
may build from the checked-out source, as the deployment log shows. Confirm
the source commit and actual image/build settings before deployment.

Production frontend/backend ports are internal (3000/4000), reached by Coolify's
proxy over Docker networking. Host bindings are reserved for the development
override; production must not reserve host ports 3000 or 4000. Preserve the
existing domains, database configuration and persistent storage. See
`docs/production-update-recovery.md` for recovery of an existing installation.

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

`COOLIFY_DEPLOY_WEBHOOK` enables deployment after the release verification gate
and both image publications succeed. A rejected webhook fails the deployment job.
Get the URL from Coolify → your resource → Deploy Webhooks → copy.
Disable any separate Coolify Git-push auto-deployment or registry webhook that
bypasses this workflow. Repository code cannot enforce an external auto-deploy
setting. Use **CI / Release verification** as a required branch check.

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

Use `docker-compose.yml` for production. Do not include
`docker-compose.dev.yml`, which publishes fixed host ports for development.
If Coolify has resource-level port mapping overrides, remove the frontend/backend
host mappings there as well. Keep proxy target ports 3000/4000 and the existing
Docker network connections.

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
2. GitHub Actions runs mandatory database integration, browser tests and production builds
3. After every check passes, both images publish; manual mode records a handoff.
   Open the existing Coolify resource and deploy the verified source/images.
   Webhook mode can trigger this only when a working HTTPS endpoint is configured.
4. Backend auto-runs `prisma migrate deploy` on startup — no manual steps
5. Verify backend/frontend runtime health, public routes and sign-in after rollout.
   Compose replacement can interrupt traffic; there is no fixed downtime guarantee.

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
| `port is already allocated` for 4000 or 3000 | Use internal production ports, remove resource-level host port overrides, and identify existing port owners before stopping anything. |

## Local development

```bash
# Option 1: Root-level single command (needs local Postgres + Redis)
npm run dev             # starts backend + frontend in watch mode

# Option 2: Full Docker stack (Postgres, Redis, Meilisearch included)
npm run docker:dev      # build from source, start everything
npm run docker:up       # pull pre-built images from ghcr.io
npm run docker:down     # stop everything
```
