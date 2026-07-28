# Flyngo — Coolify Deployment

## Files
- `docker-compose.yml` — base stack (Postgres + Redis + Meili + backend + frontend + nginx)
- `docker-compose.coolify.yml` — override: drops nginx/Postgres/Redis/Meili; injects env from Coolify; adds Traefik labels for TLS
- `.env.coolify.example` — env template to paste into Coolify

## Coolify Setup

### 1. Provision stateful services
Coolify → `+ Add` → **Service** (one each):
- **PostgreSQL 16** — name `flyngo-db`, env `POSTGRES_USER=flyngo`, `POSTGRES_PASSWORD=...`, `POSTGRES_DB=flyngo`, persistent storage `/var/lib/postgresql/data`.
- **Redis 7** — name `flyngo-redis`, persistent storage `/data`, set `REDIS_PASSWORD`.
- **Meilisearch v1.12** — name `flyngo-meili`, env `MEILI_MASTER_KEY=...`, persistent storage `/meili_data`.

### 2. Point domain DNS
- `flyngo.world` → `A` record → `200.97.172.113`
- `api.flyngo.world` → `A` record → `200.97.172.113`

### 3. Add the project
Coolify → **Projects** → `+ New` → `flyngo` → **+ New Resource** → **Docker Compose**:
- **Git Repo:** `ilhaansiddique-coder/flyngo_tours_n_travels`
- **Branch:** `main`
- **Base Directory:** *(leave empty)*
- **Docker Compose Location:** `infrastructure/docker/docker-compose.yml`
- **Docker Compose Additional Locations:** `infrastructure/docker/docker-compose.coolify.yml`

### 4. Environment variables
Coolify → Resource → **Environment Variables** → paste from `.env.coolify.example`, fill real values. Generate JWT secrets with:
```bash
openssl rand -hex 32
```

### 5. Deploy
Click **Deploy**. Watch logs. If the build fails on `frontend.Dockerfile` saying `.next/standalone` is missing, the `output: 'standalone'` line in `frontend/next.config.ts` (already added) fixes it on the next push.

### 6. First-run Prisma migration
After first successful build, open the **backend** container → **Exec**:
```bash
npx prisma migrate deploy
```
Optionally seed:
```bash
npx prisma db seed
```

### 7. Auto-deploy on push
Coolify → Resource → **Webhooks** → copy the URL → GitHub repo → Settings → Webhooks → Add. Event: `Just the push event`. Every push to `main` triggers a rebuild.

## Common issues

| Symptom | Fix |
|---|---|
| `failed to read dockerfile: open Dockerfile: no such file or directory` | Build Pack must be **Docker Compose**, not Dockerfile. |
| Frontend build fails: `Cannot find module '.next/standalone/server.js'` | `next.config.ts` missing `output: 'standalone'`. Already added in this repo. |
| Backend can't reach `flyngo-db` | Internal hostnames only work inside Coolify's network. Use `flyngo-db`, `flyngo-redis`, `flyngo-meili` exactly. |
| TLS not issuing | Domain DNS not yet propagated, or FQDN in resource doesn't match. Wait 5-10 min after DNS. |
