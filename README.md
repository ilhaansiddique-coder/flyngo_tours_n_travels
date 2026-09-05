# Flyngo — Tours & Travels Platform

Enterprise-grade, SaaS-ready travel operating system. Single-tenant deployment with full multi-tenant architecture built-in.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Styling | TailwindCSS + ShadCN UI |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Queues | BullMQ |
| Realtime | Socket.io |
| Search | Meilisearch |
| Storage | Cloudflare R2 |
| Payments | Stripe, bKash, Nagad, SSLCommerz |

## Project Structure

```
flyngo/
├── frontend/          # Next.js (public site + admin panel)
├── backend/           # NestJS API
├── infrastructure/    # Docker, NGINX, CI/CD
└── docs/              # Architecture docs, SRS, ERD
```

## Quick Start

```bash
# Install dependencies (all three workspaces)
npm install && npm --prefix backend install && npm --prefix frontend install

# Set up the database
npm run db:migrate
npm run db:seed   # optional: seed sample data

# Start both frontend + backend with one command
npm run dev
```

Backend → http://localhost:4000 (Swagger at /api/docs)  
Frontend → http://localhost:3000

### Docker (full stack: Postgres, Redis, Meilisearch, backend, frontend)

```bash
npm run docker:dev     # build from source, start everything
npm run docker:up      # pull pre-built images from ghcr.io
npm run docker:down    # stop everything
```

### Other Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start backend + frontend in watch mode |
| `npm run build` | Build both backend and frontend |
| `npm run lint` | Lint both workspaces |
| `npm run test` | Run all tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio GUI |

## Volunteer Bangladesh Trust — public site

The public site and admin panel live under `VBT/frontend`, the API under `VBT/backend`.

### Local setup (no Docker)

A standalone PostgreSQL is used for local dev on `127.0.0.1:5433` (user/db `vbt`/`vbt`). Point `VBT/backend/.env` `DATABASE_URL` at it; the Coolify Postgres URL stays in the root `.env` for deployed runs.

```bash
cd VBT/backend && npm install && npx prisma migrate deploy && npm run build:seed && node prisma/seed.js
# start backend
node dist/main            # http://localhost:4000/api/v1 (health → /api/v1/health)
cd VBT/frontend && npm install && npm run build && npx next start -p 3000
```

The frontend runs under basePath `/VBT` and rewrites `/VBT/api/v1/*` to the backend.

### Features added

- **Membership signup** — dynamic categories (volunteer ৳300/yr, general ৳1,000/yr, donor ৳5,000/yr, lifetime ৳100,000) editable via the `memberCategories` site setting. Public form at `/VBT/membership` with photo upload, consent and optional account password; status tracker by member reference (e.g. `VBT-ABC123`) via `GET /public/members/status/:ref`.
- **Member accounts** — sign up / sign in / forgot / reset password. Public at `/VBT/login`, `/VBT/signup`, `/VBT/forgot-password`, `/VBT/reset-password`, and `/VBT/account` (profile + "my memberships"). JWT stored client-side. When no SMTP is configured, forgot-password returns the reset token directly (dev mode) — set `SMTP_HOST`/`SMTP_USER`/etc. to send real emails.
- **Admin panel** at `/VBT/admin` (login → dashboard, members approval, events CRUD, landing pages CRUD, users CRUD). Admin JWT is separate from user accounts.
- **Landing pages** — page builder (slug, bilingual title/subtitle, cover photo, JSON sections of type `hero|text|split|cards|cta|gallery`, published flag, order); render at `/VBT/l/:slug`.

### Seeded accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@vbt.world` | `admin123` |
| Demo user | `demo@vbt.world` | `demo1234` |

## License

Proprietary. All rights reserved.
