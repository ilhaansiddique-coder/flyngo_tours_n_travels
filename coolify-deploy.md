# Flyngo — Coolify Deployment

## Project layout
```
flyngo_tours_n_travels/
├── backend/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
├── docker-compose.coolify.yml
└── .env.coolify.example
```

## Files
- `docker-compose.yml` — base stack (Postgres + Redis + Meili + backend + frontend + nginx). Used for local dev and as the Coolify base.
- `docker-compose.coolify.yml` — override: drops bundled Postgres/Redis/Meili; injects env from Coolify. Coolify adds Traefik labels automatically when you set FQDNs in the UI.
- `.env.coolify.example` — env template to paste into Coolify.

## Why one Docker Compose stack, not two Applications
- `depends_on` ordering only works inside one compose project
- Env vars are declared in one place
- Internal service DNS works automatically
- The override file pattern is what Coolify's "Additional Compose Locations" field is designed for

## Coolify Setup

### 1. Provision stateful services
Coolify → `+ Add` → **Service** (one each):
- **PostgreSQL 16** — name `flyngo-db`, env `POSTGRES_USER=flyngo`, `POSTGRES_PASSWORD=...`, `POSTGRES_DB=flyngo`, persistent storage `/var/lib/postgresql/data`.
- **Redis 7** — name `flyngo-redis`, persistent storage `/data`, set `REDIS_PASSWORD`.
- **Meilisearch v1.12** — name `flyngo-meili`, env `MEILI_MASTER_KEY=...`, persistent storage `/meili_data`.

### 2. Point domain DNS
- `flyngo.world` → `A` record → `<COOLIFY_SERVER_IP>`
- `api.flyngo.world` → `A` record → `<COOLIFY_SERVER_IP>`

### 3. Add the project
Coolify → **Projects** → `+ New` → `flyngo` → **+ New Resource** → **Docker Compose**:
- **Git Repo:** `ilhaansiddique-coder/flyngo_tours_n_travels`
- **Branch:** `main`
- **Base Directory:** *(leave empty)*
- **Docker Compose Location:** `docker-compose.yml`
- **Docker Compose Additional Locations:** `docker-compose.coolify.yml`
- **Build Pack:** Docker Compose (NOT Dockerfile)

Each service already has its own `Dockerfile` inside its folder, so Coolify's default build context works without any custom paths.

### 4. Set FQDNs on services
After the resource is created, click each service:
- `frontend` → FQDN: `https://flyngo.world`
- `backend` → FQDN: `https://api.flyngo.world`

Coolify adds the Traefik labels and TLS for you.

### 5. Environment variables
Coolify → Resource → **Environment Variables** → paste from `.env.coolify.example`, fill real values. Generate JWT secrets with:
```bash
openssl rand -hex 32
```

### 6. Deploy
Click **Deploy**. Watch logs. If the frontend build fails on `.next/standalone` being missing, `output: 'standalone'` must be set in `frontend/next.config.ts` (already added).

### 7. First-run Prisma migration
After first successful build, open the **backend** container → **Exec**:
```bash
npx prisma migrate deploy
```
Optionally seed:
```bash
npx prisma db seed
```

### 8. Auto-deploy on push
Coolify → Resource → **Webhooks** → copy the URL → GitHub repo → Settings → Webhooks → Add. Event: `Just the push event`.

## Common issues

| Symptom | Fix |
|---|---|
| `failed to read dockerfile: open Dockerfile: no such file or directory` | Build Pack must be **Docker Compose**, not Dockerfile. |
| Frontend build fails: `Cannot find module '.next/standalone/server.js'` | `next.config.ts` missing `output: 'standalone'`. Already added in this repo. |
| Backend can't reach `flyngo-db` / `flyngo-redis` / `flyngo-meili` | Use the Coolify service hostnames exactly. Internal DNS only works inside Coolify's network. |
| TLS not issuing | Domain DNS not yet propagated, or FQDN in resource doesn't match. Wait 5-10 min after DNS. |
