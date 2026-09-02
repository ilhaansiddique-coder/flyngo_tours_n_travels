-- Capture-first accounts: a booking may now create a provisional user that has
-- no password and cannot authenticate until staff issue a temporary one.
--
-- Ordering matters. The unique index on (tenant_id, phone_key) must be created
-- AFTER the backfill and the de-duplication below, otherwise it aborts on any
-- existing tenant that has the same number stored in two formats.
-- Every statement is idempotent so a Coolify redeploy can re-run this safely.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_key" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "temp_password_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "credentials_sent_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "claimed_at" TIMESTAMP(3);

-- Backfill: mirror the application's phoneKey() — digits only, last 10, and
-- only when there are at least 9 digits to work with.
UPDATE "users"
   SET "phone_key" = RIGHT(regexp_replace("phone", '\D', '', 'g'), 10)
 WHERE "phone_key" IS NULL
   AND "phone" IS NOT NULL
   AND length(regexp_replace("phone", '\D', '', 'g')) >= 9;

-- De-duplicate before enforcing uniqueness. Where one tenant already holds the
-- same number on several rows, the oldest account keeps the key and the others
-- are released to NULL (NULLs do not collide in a unique index). Nothing is
-- deleted and no login breaks: those rows can still sign in by email, and the
-- duplicates are visible in the admin customer list for a human to merge.
WITH ranked AS (
  SELECT "id",
         ROW_NUMBER() OVER (
           PARTITION BY "tenant_id", "phone_key"
           ORDER BY "created_at" ASC, "id" ASC
         ) AS rn
    FROM "users"
   WHERE "phone_key" IS NOT NULL
)
UPDATE "users" u
   SET "phone_key" = NULL
  FROM ranked r
 WHERE u."id" = r."id"
   AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_phone_key_key"
  ON "users" ("tenant_id", "phone_key");

-- Existing rows are real, claimed accounts; only new booking-created users are
-- provisional. Explicit rather than relying on the column default so a re-run
-- after a partial failure still lands in the right state.
UPDATE "users"
   SET "account_status" = 'active'
 WHERE "account_status" IS NULL
    OR ("account_status" = 'provisional' AND "password_hash" IS NOT NULL);
