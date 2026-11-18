#!/bin/sh
# =============================================================================
# Flyngo backend entrypoint
# =============================================================================
# Responsibilities, in order:
#   1. Apply Prisma migrations (deploy mode — never reset).
#   2. On failure, recover from a known transient state where a small set of
#      early cleanup migrations were left in a "partially applied" state.
#      The two migrations in MIGRATE_TARGETS are pure DropIndex statements
#      that are already idempotent (DROP INDEX IF EXISTS) — marking them
#      applied lets the rest of the chain run.
#   3. Seed only when explicitly requested in production (default on in dev).
#      Routine image updates must not reapply bootstrap data to client records.
#   4. Start the API.
#
# Migration failures are FATAL by default: silently running the API on a
# partial schema causes opaque 500s (the exact incident we fixed) and blocks
# every future migration. Set ALLOW_START_WITHOUT_MIGRATIONS=true only as a
# last-resort manual override.
# =============================================================================

set -e

# Two early cleanup migrations that are pure DropIndex statements and
# idempotent on re-apply. If a previous deploy left them in a failed state,
# mark them as applied and re-run the chain.
MIGRATE_TARGETS="20260820095329_init 20260814122509"

run_migrations() {
  echo "==> Running Prisma migrations..."
  npx prisma migrate deploy
}

attempt_recovery() {
  echo "==> Migrate deploy failed; checking migration status..."
  npx prisma migrate status 2>&1 || true
  echo "==> Attempting to resolve known cleanup migrations..."
  for m in $MIGRATE_TARGETS; do
    echo "    -> prisma migrate resolve --applied $m"
    npx prisma migrate resolve --applied "$m" 2>&1 || true
  done
}

if ! run_migrations; then
  attempt_recovery
  echo "==> Retrying migrate deploy..."
  if ! run_migrations; then
    if [ "${ALLOW_START_WITHOUT_MIGRATIONS:-false}" = "true" ]; then
      echo "==> WARNING: migrations failed, but ALLOW_START_WITHOUT_MIGRATIONS=true — starting anyway (best-effort)."
    else
      echo "==> ERROR: migrations failed to apply. Refusing to boot on a partial schema." >&2
      echo "    Fix the migration (e.g. 'prisma migrate resolve --rolled-back <name>' for" >&2
      echo "    an orphaned/failed migration) and redeploy. See the audit notes." >&2
      exit 1
    fi
  fi
fi

# A fresh installation can opt in once with SEED_ON_STARTUP=true. Leave it off
# afterward: the seed contains bootstrap/catalogue updates, not just inserts.
seed_on_startup="${SEED_ON_STARTUP:-false}"
if [ "${NODE_ENV:-production}" != "production" ]; then
  seed_on_startup="${SEED_ON_STARTUP:-true}"
fi
if [ "$seed_on_startup" = "true" ]; then
echo "==> Seeding database (idempotent)..."
if node prisma/seed.js; then
  echo "==> Seed complete"
else
  echo "==> Seed failed (non-fatal) — continuing to start API"
  if [ -z "${SUPER_ADMIN_PASSWORD:-}" ] && [ "${NODE_ENV:-production}" = "production" ]; then
    echo "==> WARNING: SUPER_ADMIN_PASSWORD is not set. The seed will not create an" >&2
    echo "    admin account in production. Set this env var to bootstrap the admin." >&2
  fi
fi
else
  echo "==> Skipping bootstrap seed (set SEED_ON_STARTUP=true for initial setup)"
fi

echo "==> Starting Flyngo backend..."
exec node dist/main
