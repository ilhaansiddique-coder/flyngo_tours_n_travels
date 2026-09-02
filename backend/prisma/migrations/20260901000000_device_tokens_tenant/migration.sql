-- Reconcile device_tokens table with the Prisma schema.
-- The earlier 20260826000000_add_device_tokens migration created the table
-- without the tenant_id column, while the DeviceToken model (and
-- registerDeviceToken) require it. Add the column, backfill from the first
-- tenant, and align unique/index constraints with the schema.

-- 1) Add tenant_id (nullable first so the column exists before backfill).
ALTER TABLE "device_tokens" ADD COLUMN "tenant_id" TEXT;

-- 2) Backfill any existing rows with the first available tenant.
UPDATE "device_tokens" SET "tenant_id" = (SELECT "id" FROM "tenants" ORDER BY "created_at" ASC, "id" ASC LIMIT 1) WHERE "tenant_id" IS NULL;

-- 3) Make it NOT NULL (matches the model's required String). Safe now that rows
--    are backfilled; a fresh table has no rows.
ALTER TABLE "device_tokens" ALTER COLUMN "tenant_id" SET NOT NULL;

-- 4) Drop the old single-`token` unique index (the model uses [userId, token]).
DROP INDEX IF EXISTS "device_tokens_token_key";

-- 5) Create the model's unique constraint on (user_id, token).
CREATE UNIQUE INDEX "device_tokens_user_id_token_key" ON "device_tokens"("user_id", "token");

-- 6) Create the model's index on (tenant_id, user_id).
CREATE INDEX "device_tokens_tenant_id_user_id_idx" ON "device_tokens"("tenant_id", "user_id");
