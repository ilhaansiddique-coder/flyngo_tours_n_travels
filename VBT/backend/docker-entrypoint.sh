#!/bin/sh
# =============================================================================
# VBT backend entrypoint
#  1. Apply Prisma migrations (deploy mode — never resets).
#  2. Seed the database on every boot (idempotent upserts) — non-fatal.
#  3. Start the API.
# =============================================================================

set -e

echo "==> Running Prisma migrations..."
if ! npx prisma migrate deploy; then
  echo "==> WARNING: migrations failed; starting API anyway (best-effort)."
fi

echo "==> Seeding database (idempotent)..."
if node prisma/seed.js; then
  echo "==> Seed complete"
else
  echo "==> Seed failed (non-fatal) — continuing to start API"
fi

echo "==> Starting VBT backend..."
exec node dist/main