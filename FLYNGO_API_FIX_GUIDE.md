# Flyngo Backend API — Complete Setup & Troubleshooting Guide

## Quick Status Check

Your routes **ARE properly defined**:
- ✅ `GET /api/v1/tours` — ToursController line 14
- ✅ `POST /api/v1/auth/login` — AuthController line 35
- ✅ `POST /api/v1/auth/register` — AuthController line 49

If you're getting "Cannot GET/POST" errors, it's one of these issues:

---

## 🔧 Step 1: Verify Backend Is Running

### Check if backend is listening on port 4000:
```bash
# Test the health endpoint (no auth required)
curl http://localhost:4000/api/v1/health

# Expected response:
# {"status":"ok"}
```

### If no response, the backend is NOT running. Start it:
```bash
cd backend
npm install  # Install dependencies first
npm run start:dev
```

You should see:
```
[NestFactory] Nest application successfully started
Server running on http://localhost:4000
Swagger docs at http://localhost:4000/api/docs
```

---

## 🗄️ Step 2: Setup Database

### Prerequisites:
- **PostgreSQL 13+** running locally or in Docker

### Option A: Docker (Recommended)
```bash
# Start PostgreSQL + Redis from the infrastructure folder
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis

# Wait ~10 seconds for services to be ready
sleep 10
```

### Option B: Local PostgreSQL
- Install PostgreSQL locally
- Create database: `createdb -U postgres flyngo`
- Update `.env` DATABASE_URL if needed

### Setup Database Schema:
```bash
cd backend

# Create .env file if it doesn't exist
cp .env.example .env

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

Expected output:
```
✔ Prisma schema validated
✔ Prisma migration applied
✔ Database seeded successfully
```

---

## 🔐 Step 3: Configure Environment Variables

### Edit `backend/.env`:
```dotenv
# Database (local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flyngo?schema=public

# Or if you started it with Docker:
DATABASE_URL=postgresql://postgres:password@localhost:5432/flyngo?schema=public

# JWT secrets (change these in production!)
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Seed admin account
SUPER_ADMIN_PASSWORD=Admin123!

# Enable Swagger for testing
ENABLE_SWAGGER=true
```

---

## 🧪 Step 4: Test the APIs

### 1️⃣ Get All Tours
```bash
curl http://localhost:4000/api/v1/tours \
  -H "X-Tenant-Id: 00000000-0000-0000-0000-000000000001"

# Expected response:
# {"items":[], "meta":{"page":1,"limit":20,"total":0,"totalPages":0}}
```

### 2️⃣ Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@flyngo.com",
    "password": "Admin123!"
  }'

# Expected response:
# {
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "eyJhbGc...",
#   "expiresIn": 86400
# }
```

### 3️⃣ Register New User
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "John Doe",
    "phone": "+1234567890"
  }'
```

### 4️⃣ View Swagger UI
```
Open in browser: http://localhost:4000/api/docs
```

---

## 🐛 Debugging Common Errors

### Error: "Cannot GET /api/v1/tours"
**Cause:** Backend not running  
**Fix:**
```bash
cd backend
npm run start:dev
```

### Error: "Cannot POST /api/v1/auth/login"
**Cause:** Backend not running or CORS misconfigured  
**Fix:**
1. Make sure backend is running
2. Check `FRONTEND_URL` in `.env` matches your frontend URL

### Error: "Database connection failed"
**Cause:** PostgreSQL not running  
**Fix:**
```bash
# Start Docker services
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis

# Or verify local PostgreSQL is running
psql -U postgres -l
```

### Error: "NestJS refuses to start with well-known public JWT secrets"
**Cause:** You're in production mode with default JWT secrets  
**Fix:** Set strong JWT secrets in `.env`:
```dotenv
JWT_ACCESS_SECRET=your-very-long-random-string-at-least-32-characters
JWT_REFRESH_SECRET=another-very-long-random-string-at-least-32-characters
```

### Error: "CORS rejected origin"
**Cause:** Frontend URL doesn't match `FRONTEND_URL` in `.env`  
**Fix:** Update `.env`:
```dotenv
FRONTEND_URL=http://localhost:3000
```

---

## 📋 Complete Startup Checklist

- [ ] PostgreSQL is running (`docker compose up -d postgres`)
- [ ] `.env` file exists with correct `DATABASE_URL`
- [ ] `npm install` completed in `backend/`
- [ ] `npm run db:migrate` executed successfully
- [ ] `npm run db:seed` executed successfully
- [ ] `npm run start:dev` shows "Server running on http://localhost:4000"
- [ ] `curl http://localhost:4000/api/v1/health` returns `{"status":"ok"}`
- [ ] Swagger accessible at `http://localhost:4000/api/docs`

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `backend/src/main.ts` | Server bootstrap & setup |
| `backend/src/app.module.ts` | Module imports (includes ToursModule & AuthModule) |
| `backend/src/modules/tours/` | Tours API logic |
| `backend/src/modules/auth/` | Authentication logic |
| `backend/.env` | Environment variables |
| `backend/prisma/schema.prisma` | Database schema |

---

## 🚀 Next Steps

1. Complete the checklist above
2. Test the APIs using curl/Postman
3. Read the README.md at the root for full dev environment setup
4. Check Swagger docs for all available endpoints

**Still stuck?** Share:
- Output from `npm run start:dev`
- Output from `curl http://localhost:4000/api/v1/health`
- Your `.env` file (without secrets)
