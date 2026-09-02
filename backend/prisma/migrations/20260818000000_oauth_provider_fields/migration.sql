-- Add OAuth provider fields to users table
ALTER TABLE "users" ADD COLUMN "provider"     TEXT;
ALTER TABLE "users" ADD COLUMN "provider_id"  TEXT;

-- Link existing accounts that already match a provider email by index lookup.
-- No data backfill is needed at this point; new signups will populate these.
CREATE INDEX "users_provider_idx" ON "users" ("provider", "provider_id");
