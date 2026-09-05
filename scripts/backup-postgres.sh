#!/bin/sh
# =============================================================================
# Flyngo Postgres backup
# =============================================================================
# Dumps the application database from the Coolify/Docker postgres container to
# a dated file. Run BEFORE any `prisma migrate deploy` on production and on a
# schedule (e.g. cron) for durable backups.
#
# Usage:
#   scripts/backup-postgres.sh [container-name]
#
# Env overrides:
#   BACKUP_DIR   destination directory (default: ~/backups/flyngo)
#   POSTGRES_USER (default: flyngo)
#   POSTGRES_DB   (default: flyngo)
#
# Examples:
#   scripts/backup-postgres.sh
#   scripts/backup-postgres.sh postgres-srkvtkbrer62q7477h23tf72-073811149426
# =============================================================================

set -e

CONTAINER="${1:-$(
  docker ps --format '{{.Names}}' | grep -E '^postgres-' | head -1
)}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/flyngo}"
PG_USER="${POSTGRES_USER:-flyngo}"
PG_DB="${POSTGRES_DB:-flyngo}"

if [ -z "$CONTAINER" ]; then
  echo "ERROR: no postgres container found." >&2
  echo "Pass the container name: $0 <container-name>" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/flyngo-$STAMP.sql.gz"

echo "==> Backing up database '$PG_DB' from container '$CONTAINER'..."

docker exec "$CONTAINER" pg_dump -U "$PG_USER" -d "$PG_DB" | gzip > "$OUT"

SIZE="$(du -h "$OUT" | cut -f1)"
echo "==> Backup written: $OUT ($SIZE)"
echo "    Copy this file off the box (offsite storage) to be a real backup."

# Basic sanity check: a dump that only contains comments is almost certainly empty.
if [ "$(gzip -cd "$OUT" | head -c 1000 | grep -c 'COPY\|CREATE')" = "0" ]; then
  echo "WARNING: backup looks empty — refusing to leave a misleading file." >&2
  rm -f "$OUT"
  exit 1
fi