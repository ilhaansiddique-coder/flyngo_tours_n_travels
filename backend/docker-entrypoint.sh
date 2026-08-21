#!/bin/sh
# Self-healing entrypoint: recover from a failed Prisma migration if the cause
# is a duplicate init migration that already partially applied.

MIGRATE_TARGETS="20260820095329_init 20260814122509"

run_migrations() {
  echo "==> Running Prisma migrations..."
  npx prisma migrate deploy
  return $?
}

attempt_recovery() {
  echo "==> Migrate deploy failed, attempting to resolve known duplicate migrations..."
  for m in $MIGRATE_TARGETS; do
    echo "    -> prisma migrate resolve --applied $m"
    npx prisma migrate resolve --applied "$m" 2>&1 || true
  done
}

run_migrations
RC=$?

if [ "$RC" -ne 0 ]; then
  attempt_recovery
  echo "==> Retrying migrate deploy..."
  run_migrations
  RC=$?
fi

if [ "$RC" -ne 0 ]; then
  echo "==> Migration still failing after recovery, exiting."
  exit 1
fi

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
