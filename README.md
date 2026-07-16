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
# Development
docker compose -f infrastructure/docker/docker-compose.yml up -d
cd backend && npm install && npx prisma migrate dev && npm run start:dev
cd frontend && npm install && npm run dev
```

## Environment

Copy `.env.example` to `.env` in both `backend/` and `frontend/`.

## License

Proprietary. All rights reserved.
