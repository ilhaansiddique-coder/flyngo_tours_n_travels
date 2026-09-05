# Production database recovery runbook

This documents how to fix the production migration incident and, in general, how
to safely apply schema changes on the Coolify-hosted Postgres without data loss.
It mirrors what the docker-compose `docker-entrypoint.sh` now enforces: migration
failures are fatal instead of silently booting on a partial schema.

## The incident (fixed on the server)

Production `flyngo` DB had an orphaned **failed** migration recorded in
`_prisma_migrations`:

```
20260831000000_device_tokens   -> FAILED
```

That exact migration does **not** exist in this repository (it was generated
against the shared DB, failed, then superseded by
`20260901000000_device_tokens_tenant`). Because Prisma refuses to apply any new
migrations while a failed one is recorded, `npx prisma migrate deploy` returned
P3009 and the backend kept booting on a schema missing `offline_payments_invoices`
and `customer_documents_structured` — producing "Internal server error" on login.

### How it was resolved

On the server (from the backend container):

```sh
# 1. Identify the backend + postgres containers
docker ps --format '{{.Names}}\t{{.Image}}'

# 2. Back up first! (see scripts/backup-postgres.sh)
# 3. Get DB connection info (read-only)
docker exec <backend-container> env | grep -i database

# 4. Mark the orphaned failed migration 'rolled-back' (it was superseded)
docker exec -w /app <backend-container> npx prisma migrate resolve \
  --rolled-back 20260831000000_device_tokens

# 5. Apply all pending migrations
docker exec -w /app <backend-container> npx prisma migrate deploy

# 6. Regenerate client + restart so the full (matched) schema is live
docker exec -w /app <backend-container> npx prisma generate
docker restart <backend-container>
```

Verify with `docker exec -w /app <backend-container> npx prisma migrate status` —
it should report "Database schema is up to date!".

## Ongoing policy

- `prisma migrate deploy` runs in `docker-entrypoint.sh` on every boot.
- If it fails after the built-in recovery, the container **exits 1** instead of
  starting half-migrated, unless `ALLOW_START_WITHOUT_MIGRATIONS=true` is set.
- Never delete a migration folder that has been applied/pushed to production.
  If a migration is wrong, add a corrective migration rather than editing history.

## Resolving OTHER failed migrations (P3009)

1. `docker exec -it <backend-container> sh`
2. `npx prisma migrate status` — note the failed migration name.
3. Decide:
   - Migration is **superseded/never needed** → `npx prisma migrate resolve --rolled-back <name>`
   - Migration **already applied** but recorded failed after the fact → first *verify*
     the schema changed on the DB, then `npx prisma migrate resolve --applied <name>`
4. `npx prisma migrate deploy` again, then restart.

## Safe rollbacks

There are no Prisma "down" migrations. To roll back a bad deploy, either:

- Re-deploy the previous image tag (code only; does not touch data), or
- Restore a backup (see below) — this rolls back data AND schema.

## Backups

Use `scripts/backup-postgres.sh`. It dumps the `flyngo` database from the
Coolify postgres container with `pg_dump` to a dated file and prints the path.
Schedule it (e.g. cron) and copy the dumps off-box.

Always take a backup **before** running `migrate deploy` on production.