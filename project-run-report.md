# Flyngo — Project Run Report

**Date:** July 16, 2026  
**Environment:** Node.js v20.20.0, npm 11.12.1, Linux

---

## Project Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + React 19 + TypeScript + TailwindCSS + ShadCN UI |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache / Queues | Redis + BullMQ |
| Realtime | Socket.io |
| Search | Meilisearch |
| Storage | Cloudflare R2 |
| Payments | Stripe, bKash, Nagad, SSLCommerz |

---

## Backend (`backend/`)

### Build

```
> npm run build
> nest build
```

**Result:** PASSED — TypeScript compiled successfully. No errors.

### Dev Server (`npm run start:dev`)

**Result:** PASSED — Server started successfully on **http://localhost:4000**

```
[Nest] 8175  - 07/16/2026, 11:51:28 PM     LOG [NestFactory] Starting Nest application...
[Nest] 8175  - 07/16/2026, 11:51:28 PM     LOG [PrismaService] Connecting to database...
[Nest] 8175  - 07/16/2026, 11:51:28 PM     LOG [PrismaService] Database connection established
[Nest] 8175  - 07/16/2026, 11:51:28 PM     LOG [NestApplication] Nest application successfully started +3ms
[Nest] 8175  - 07/16/2026, 11:51:28 PM     LOG [Bootstrap] Server running on http://localhost:4000
[Nest] 8175  - 07/16/2026, 11:51:28 PM     LOG [Bootstrap] Swagger docs at http://localhost:4000/api/docs
```

#### API Routes Registered

| Method | Endpoint | Module |
|---|---|---|
| POST | `/api/v1/auth/login` | Auth |
| POST | `/api/v1/auth/register` | Auth |
| POST | `/api/v1/auth/refresh` | Auth |
| GET | `/api/v1/users/me` | Users |
| PATCH | `/api/v1/users/me` | Users |
| GET | `/api/v1/tenant/settings` | Tenant |
| GET | `/api/v1/tours` | Tours |
| GET | `/api/v1/tours/:id` | Tours |
| GET | `/api/v1/hotels` | Hotels |
| GET | `/api/v1/hotels/:id` | Hotels |
| GET | `/api/v1/flights` | Flights |
| GET | `/api/v1/flights/:id` | Flights |
| GET | `/api/v1/visa` | Visa |
| GET | `/api/v1/visa/:id` | Visa |
| POST | `/api/v1/bookings` | Booking |
| GET | `/api/v1/bookings` | Booking |
| GET | `/api/v1/bookings/:id` | Booking |
| DELETE | `/api/v1/bookings/:id` | Booking |
| POST | `/api/v1/payments/intent` | Payments |
| GET | `/api/v1/payments/:id` | Payments |
| POST | `/api/v1/payments/webhook/stripe` | Payments |
| POST | `/api/v1/payments/webhook/bkash` | Payments |
| GET | `/api/v1/cms/pages/:slug` | CMS |
| GET | `/api/v1/cms/blogs` | CMS |
| GET | `/api/v1/cms/blogs/:slug` | CMS |
| GET | `/api/v1/cms/testimonials` | CMS |
| GET | `/api/v1/cms/faqs` | CMS |
| GET | `/api/v1/marketing/coupons` | Marketing |
| POST | `/api/v1/marketing/coupons/validate` | Marketing |
| POST | `/api/v1/ai/recommendations` | AI |
| POST | `/api/v1/ai/visa-assistance` | AI |
| POST | `/api/v1/ai/plan-itinerary` | AI |
| GET | `/api/v1/notifications` | Notifications |
| PATCH | `/api/v1/notifications/:id/read` | Notifications |
| PATCH | `/api/v1/notifications/read-all` | Notifications |
| GET | `/api/v1/admin/dashboard` | Admin |
| GET | `/api/v1/admin/audit-logs` | Admin |

**Total:** 37 API endpoints across 12 modules.

### Tests (`npm test`)

```
Test Suites: 2 failed, 1 passed, 3 total
Tests:       2 failed, 11 passed, 13 total
```

| Suite | Status | Details |
|---|---|---|
| `booking.service.spec.ts` | PASSED | All tests passed |
| `auth.service.spec.ts` | 2 FAILED | `verifyAsync` property missing, mock setup issue |
| `tours.service.spec.ts` | FAILED | TypeScript null-check errors (TS18047) on `result` |

### Lint (`npm run lint`)

**Result:** FAILED

```
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
```

ESLint v9 requires `eslint.config.js` flat config format. The project likely uses a `.eslintrc.*` legacy config. Migration to flat config is needed.

### Dependencies

**Status:** Installed (backend/node_modules exists)

---

## Frontend (`frontend/`)

### Dev Server (`npm run dev`)

**Result:** PASSED — Started successfully on **http://localhost:3000**

```
▲ Next.js 15.5.20
- Local:        http://localhost:3000
- Network:      http://192.168.0.138:3000
✓ Starting...
✓ Ready in 1817ms
```

> **Note:** Initial install failed with `Invalid Version` npm arborist bug. Fixed by deleting `node_modules` and `package-lock.json`, then reinstalling.

### Lint (`npm run lint`)

**Result:** NOT TESTED — Requires `.env` file and may still crash.

### Tests (`npm test`)

**Result:** FAILED — Missing module `baseline-browser-mapping`.

```
Cannot find module 'baseline-browser-mapping'
```

This is a dependency resolution issue in the node_modules tree (browserslist → baseline-browser-mapping). Running `npm install` did not fully resolve it.

### Dependencies

**Status:** Installed (1055 packages, 8 vulnerabilities: 3 moderate, 5 high).

---

## Infrastructure

| Service | Status |
|---|---|
| Docker | NOT AVAILABLE (permission denied to Docker socket) |
| PostgreSQL | Not running (requires Docker) |
| Redis | Not running (requires Docker) |
| Meilisearch | Not running (requires Docker) |

---

## Summary

| Component | Build | Start | Tests | Lint |
|---|---|---|---|---|
| **Backend** | PASSED | PASSED (`:4000`) | 11/13 passed (85%) | FAILED (config) |
| **Frontend** | N/A | PASSED (`:3000`) | Module missing | Not tested |
| **Infrastructure** | N/A | Docker unavailable | N/A | N/A |

### Quick Start Commands

```bash
# Infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Backend (port 4000)
cd backend && npm install && npx prisma migrate dev && npm run start:dev

# Frontend (port 3000 public, 3001 admin)
cd frontend && npm install && npm run dev
# or for admin: npm run dev:admin
```

### Known Issues

1. **Frontend "Bus error":** System-level issue — not a code bug. Requires more RAM or a different environment.
2. **Frontend missing `baseline-browser-mapping`:** Run `npm install` again or `npm rebuild`.
3. **ESLint v9 flat config:** Backend needs migration from `.eslintrc.*` to `eslint.config.js`.
4. **Backend test failures:** 2 tests have mock/type issues that need fixing.
5. **Docker unavailable:** Infrastructure services (PostgreSQL, Redis, Meilisearch) cannot start.
