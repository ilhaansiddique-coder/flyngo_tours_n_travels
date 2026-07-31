# Flyngo — Architecture Documentation

## Phase 1: Architecture & Foundation

### Overview

Flyngo is a single-tenant tours & travels platform with SaaS-ready architecture. Every table, service, and feature is tenant-scoped from day one, even though the system currently operates with `MULTI_TENANT=false`.

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **UUID Primary Keys** | Distributed-safe, no key collisions across tenants when scaling |
| **Soft Deletes** | All tables use `deleted_at` column — data is never truly destroyed |
| **Tenant Context via Header** | `X-Tenant-Id` header propagates tenant context through all services |
| **Repository Pattern** | Prisma service as dependency-injected repository, swappable if needed |
| **Clean Architecture** | Modules isolated, dependency injection via NestJS, no circular deps |
| **RBAC with Permissions** | Role-based access control with granular permission matrix |
| **Environment-Driven Config** | All secrets and configs from environment variables, never hardcoded |

### Data Flow

```
Client Browser
    │
    ├── Next.js Frontend (SSR/ISR)
    │       │
    │       ├── REST API calls to /api/v1/*
    │       └── WebSocket connection to /socket.io
    │
    ▼
NestJS Backend
    │
    ├── TenantMiddleware (extract X-Tenant-Id)
    ├── JwtAuthGuard (verify JWT, attach user context)
    ├── RolesGuard / PermissionsGuard (RBAC check)
    ├── Service Layer (business logic)
    ├── PrismaService (database access)
    │
    ▼
PostgreSQL ← Redis (cache) ← BullMQ (queues) ← Meilisearch (search)
```

### Tenant Settings Strategy

Every tenant's configuration is stored in `tenant_settings` table:
- **Branding**: logo, favicon, colors
- **Company Info**: name, email, phone, address
- **Localization**: default currency, language, timezone
- **Payments**: gateway keys (encrypted at rest)
- **Analytics**: GA4, GTM, Meta Pixel IDs
- **Social**: social media URLs

Tenant ID is either resolved via:
1. `X-Tenant-Id` request header
2. Domain-based resolution (production)
3. Default tenant "flyngo" (single-tenant mode)

### Environment Strategy

Three layers of configuration:
1. **Root `.env`** — shared variables
2. **`backend/.env`** — backend-specific (database, secrets, API keys)
3. **`frontend/.env`** — client-safe variables (prefixed `NEXT_PUBLIC_`)

### Security Architecture

- Helmet headers (X-Frame-Options, X-Content-Type-Options, CSP)
- CORS whitelist (frontend + admin URLs)
- bcrypt for password hashing (cost factor 12)
- JWT access tokens (15min) + refresh tokens (7d) with rotation
- Rate limiting via Redis
- Input validation with class-validator + Zod
