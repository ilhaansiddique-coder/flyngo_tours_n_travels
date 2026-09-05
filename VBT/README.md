# VBT — Volunteer Bangladesh Trust

Design clone of [assunnahfoundation.org](https://assunnahfoundation.org/), served at `https://flyngo.world/VBT`.

Monorepo: NestJS 11 + Prisma 6 + PostgreSQL 16 backend, Next.js 16 frontend (Tailwind 4). Content is API/DB-driven. Admin UI is not included; use `POST /api/v1/admin/auth/login` and `/api/v1/admin/:model`.

## Local development

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Postgres. On this dev machine a standalone PG 18 runs on 127.0.0.1:5433
# (vbt/vbt) — see below. On machines with Docker: `docker compose up postgres -d`.
# Point backend/.env DATABASE_URL at whichever Postgres you use.

cd backend && npm install && npx prisma migrate deploy && npm run db:seed
cd ../frontend && npm install

# from VBT/
npm install
npm run dev
```

- Site: http://localhost:3000/VBT
- API: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/api/docs
- Admin: `admin@vbt.world` / `admin123`

Docker (build from source):

```bash
npm run docker:dev
```

## Local Postgres (this dev machine)

A standalone PostgreSQL 18 instance is started with `initdb`/`pg_ctl` on
`127.0.0.1:5433` (user/password `vbt`, db `vbt`) because Docker is not
available in this shell:

```bash
/usr/lib/postgresql/18/bin/initdb -D /tmp/opencode/vbt-pg -U vbt --pwfile=/tmp/opencode/vbt-pw -A md5 -E UTF8 --locale=C.UTF-8
/usr/lib/postgresql/18/bin/pg_ctl -D /tmp/opencode/vbt-pg -l /tmp/opencode/vbt-pg/log \
  -o "-p 5433 -h 127.0.0.1 -c unix_socket_directories=/tmp/opencode" start
/usr/lib/postgresql/18/bin/pg_ctl -D /tmp/opencode/vbt-pg stop     # to stop
```

## Coolify

1. Create a **separate PostgreSQL 16** resource. Copy its **internal** `DATABASE_URL`
   (host of the form `hpp6…:5432` only resolves inside Coolify's Docker network —
   use it in the backend's env on Coolify, not from outside).
2. Deploy this stack (`docker-compose.yml`) or two apps (backend + frontend images).
3. Backend env: `DATABASE_URL=<Coolify internal Postgres URL>`, `JWT_ACCESS_SECRET`, `FRONTEND_URL=https://flyngo.world`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Frontend env: `BACKEND_URL=http://backend:4000` (internal), `NEXT_PUBLIC_SITE_URL=https://flyngo.world`, `NEXT_PUBLIC_VBT_BASE_PATH=/VBT`, `NEXT_PUBLIC_VBT_USE_BASEPATH=true`.
5. Proxy `https://flyngo.world/VBT` → frontend `:3000` **keeping** the `/VBT` prefix.
6. Migration + seed run automatically on backend start (`docker-entrypoint.sh`):
   `prisma migrate deploy` → `node prisma/seed.js` → `node dist/main`. The migration
   has already been applied to this project's dev DB; the Coolify DB will get it on
   first deploy. To migrate+seed the Coolify DB from outside, toggle the Postgres
   resource **"Make it publicly available"** and paste the resulting public URL into
   `DATABASE_URL` for `npx prisma migrate deploy` (then revert).

If Coolify strips `/VBT` before the container, set `NEXT_PUBLIC_VBT_USE_BASEPATH=false` and rebuild the frontend.

Images (when published):

- `ghcr.io/ilhaansiddique-coder/vbt-backend:main`
- `ghcr.io/ilhaansiddique-coder/vbt-frontend:main`

Donations store a reference only (`PENDING`). No payment gateway is wired.
