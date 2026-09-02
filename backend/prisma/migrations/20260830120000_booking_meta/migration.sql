-- Flow-specific booking answers (visa application, custom-quote brief) that
-- have no dedicated column. Idempotent so it is safe to re-run on a Coolify
-- redeploy where the column may already exist.
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "meta" JSONB;
