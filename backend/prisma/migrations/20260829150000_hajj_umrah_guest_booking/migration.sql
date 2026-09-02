-- Hajj/Umrah bookings: allow guests + capture lead contact + public tracking code.
-- Idempotent so it is safe to re-run against an already-migrated database.

-- Guests may book without an account (mirrors bookings.user_id).
ALTER TABLE "hajj_umrah_bookings" ALTER COLUMN "user_id" DROP NOT NULL;

-- Lead contact so the admin table shows a name/phone for guest bookings.
ALTER TABLE "hajj_umrah_bookings" ADD COLUMN IF NOT EXISTS "customer_name" TEXT;
ALTER TABLE "hajj_umrah_bookings" ADD COLUMN IF NOT EXISTS "customer_phone" TEXT;
ALTER TABLE "hajj_umrah_bookings" ADD COLUMN IF NOT EXISTS "customer_email" TEXT;

-- Public FLY- tracking code.
ALTER TABLE "hajj_umrah_bookings" ADD COLUMN IF NOT EXISTS "booking_code" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "hajj_umrah_bookings_booking_code_key"
  ON "hajj_umrah_bookings" ("booking_code");
