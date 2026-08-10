#!/bin/sh
set -e

echo "==> Running Prisma migrations..."
npx prisma migrate deploy

# Seed only if no users exist (idempotent on first boot).
USER_COUNT=$(node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(n=>{console.log(n);return p.\$disconnect()})")
if [ "$USER_COUNT" = "0" ]; then
  echo "==> Seeding database (no users found)..."
  node prisma/seed.js
else
  echo "==> Skipping seed (found $USER_COUNT users)"
fi

echo "==> Starting Flyngo backend..."
exec node dist/main
